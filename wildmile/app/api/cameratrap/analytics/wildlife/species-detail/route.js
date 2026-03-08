import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import { enrichWithCommonNames } from "lib/wildlife/resolveCommonNames";

export const maxDuration = 30;

function buildMatchStage(searchParams) {
  const match = { observationType: "animal", scientificName: { $ne: null } };
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const deploymentId = searchParams.get("deploymentId");

  if (startDate || endDate) {
    match.eventStart = {};
    if (startDate) match.eventStart.$gte = new Date(startDate);
    if (endDate) match.eventStart.$lte = new Date(endDate);
  }
  if (deploymentId) {
    const mongoose = require("mongoose");
    match.deploymentId = new mongoose.Types.ObjectId(deploymentId);
  }
  return match;
}

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const selectedSpecies = searchParams.get("species");

  try {
    const match = buildMatchStage(searchParams);

    if (selectedSpecies) {
      match.scientificName = selectedSpecies;

      const [stats, durationBuckets, demographics, timeline] =
        await Promise.all([
          Observation.aggregate([
            { $match: match },
            {
              $group: {
                _id: null,
                totalObservations: { $sum: 1 },
                totalIndividuals: { $sum: { $ifNull: ["$count", 1] } },
                firstSeen: { $min: "$eventStart" },
                lastSeen: { $max: "$eventStart" },
                uniqueMedia: { $addToSet: "$mediaId" },
                avgCount: { $avg: { $ifNull: ["$count", 1] } },
              },
            },
            {
              $project: {
                _id: 0,
                totalObservations: 1,
                totalIndividuals: 1,
                firstSeen: 1,
                lastSeen: 1,
                uniqueMedia: { $size: "$uniqueMedia" },
                avgCount: { $round: ["$avgCount", 1] },
              },
            },
          ]).option({ allowDiskUse: true }),

          // Duration of stay distribution (eventEnd - eventStart in minutes)
          Observation.aggregate([
            { $match: match },
            {
              $project: {
                durationMin: {
                  $divide: [
                    { $subtract: ["$eventEnd", "$eventStart"] },
                    60000,
                  ],
                },
              },
            },
            {
              $bucket: {
                groupBy: "$durationMin",
                boundaries: [0, 1, 5, 15, 30, 60, 120, 360, 1440, Infinity],
                default: "other",
                output: { count: { $sum: 1 } },
              },
            },
          ]).option({ allowDiskUse: true }),

          // Life stage and sex breakdown
          Observation.aggregate([
            { $match: match },
            {
              $facet: {
                lifeStage: [
                  { $match: { lifeStage: { $ne: null } } },
                  { $group: { _id: "$lifeStage", count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                ],
                sex: [
                  { $match: { sex: { $ne: null } } },
                  { $group: { _id: "$sex", count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                ],
                behavior: [
                  { $match: { behavior: { $ne: null } } },
                  { $group: { _id: "$behavior", count: { $sum: 1 } } },
                  { $sort: { count: -1 } },
                  { $limit: 10 },
                ],
              },
            },
          ]).option({ allowDiskUse: true }),

          // Monthly observation timeline
          Observation.aggregate([
            { $match: match },
            {
              $group: {
                _id: {
                  year: { $year: "$eventStart" },
                  month: { $month: "$eventStart" },
                },
                count: { $sum: 1 },
                individuals: { $sum: { $ifNull: ["$count", 1] } },
              },
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            {
              $project: {
                _id: 0,
                month: {
                  $concat: [
                    { $toString: "$_id.month" },
                    "/",
                    { $toString: "$_id.year" },
                  ],
                },
                count: 1,
                individuals: 1,
              },
            },
          ]).option({ allowDiskUse: true }),
        ]);

      const durationLabels = {
        0: "<1 min",
        1: "1-5 min",
        5: "5-15 min",
        15: "15-30 min",
        30: "30-60 min",
        60: "1-2 hr",
        120: "2-6 hr",
        360: "6-24 hr",
        1440: "24+ hr",
        other: "Other",
      };

      const duration = durationBuckets.map((b) => ({
        label: durationLabels[b._id] || String(b._id),
        count: b.count,
      }));

      return NextResponse.json({
        stats: stats[0] || null,
        duration,
        demographics: demographics[0] || {
          lifeStage: [],
          sex: [],
          behavior: [],
        },
        timeline,
      });
    }

    // No species selected: return species list with counts
    const speciesList = await Observation.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$scientificName",
          count: { $sum: 1 },
          individuals: { $sum: { $ifNull: ["$count", 1] } },
        },
      },
      { $sort: { count: -1 } },
      {
        $project: {
          _id: 0,
          species: "$_id",
          count: 1,
          individuals: 1,
        },
      },
    ]).option({ allowDiskUse: true });

    const enrichedList = await enrichWithCommonNames(speciesList);
    return NextResponse.json({ speciesList: enrichedList });
  } catch (error) {
    console.error("Wildlife species-detail analytics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
