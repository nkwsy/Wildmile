import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import { enrichWithCommonNames } from "lib/wildlife/resolveCommonNames";

export const maxDuration = 30;

function buildMatchStage(searchParams) {
  const match = { observationType: "animal", scientificName: { $ne: null } };
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const species = searchParams.get("species");
  const deploymentId = searchParams.get("deploymentId");

  if (startDate || endDate) {
    match.eventStart = {};
    if (startDate) match.eventStart.$gte = new Date(startDate);
    if (endDate) match.eventStart.$lte = new Date(endDate);
  }
  if (species) {
    const list = species.split(",").map((s) => s.trim());
    if (list.length === 1) match.scientificName = list[0];
    else match.scientificName = { $in: list };
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

  try {
    const match = buildMatchStage(searchParams);

    const [statsResult, topSpecies, monthlyTrend, calendarData] =
      await Promise.all([
        Observation.aggregate([
          { $match: match },
          {
            $group: {
              _id: null,
              totalObservations: { $sum: 1 },
              uniqueSpecies: { $addToSet: "$scientificName" },
              uniqueMedia: { $addToSet: "$mediaId" },
              totalIndividuals: { $sum: { $ifNull: ["$count", 1] } },
              earliestDate: { $min: "$eventStart" },
              latestDate: { $max: "$eventStart" },
            },
          },
          {
            $project: {
              _id: 0,
              totalObservations: 1,
              uniqueSpecies: { $size: "$uniqueSpecies" },
              uniqueMedia: { $size: "$uniqueMedia" },
              totalIndividuals: 1,
              earliestDate: 1,
              latestDate: 1,
            },
          },
        ]).option({ allowDiskUse: true }),

        Observation.aggregate([
          { $match: match },
          {
            $group: {
              _id: "$scientificName",
              count: { $sum: 1 },
              individuals: { $sum: { $ifNull: ["$count", 1] } },
              firstSeen: { $min: "$eventStart" },
              lastSeen: { $max: "$eventStart" },
            },
          },
          { $sort: { count: -1 } },
          { $limit: 20 },
          {
            $project: {
              _id: 0,
              species: "$_id",
              count: 1,
              individuals: 1,
              firstSeen: 1,
              lastSeen: 1,
            },
          },
        ]).option({ allowDiskUse: true }),

        Observation.aggregate([
          { $match: match },
          {
            $group: {
              _id: {
                year: { $year: "$eventStart" },
                month: { $month: "$eventStart" },
              },
              observations: { $sum: 1 },
              uniqueSpecies: { $addToSet: "$scientificName" },
              uniqueMedia: { $addToSet: "$mediaId" },
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
              observations: 1,
              speciesCount: { $size: "$uniqueSpecies" },
              mediaCount: { $size: "$uniqueMedia" },
            },
          },
        ]).option({ allowDiskUse: true }),

        Observation.aggregate([
          { $match: match },
          {
            $group: {
              _id: {
                $dateToString: { format: "%Y-%m-%d", date: "$eventStart" },
              },
              count: { $sum: 1 },
            },
          },
          { $project: { _id: 0, date: "$_id", count: 1 } },
        ]).option({ allowDiskUse: true }),
      ]);

    const stats = statsResult[0] || {
      totalObservations: 0,
      uniqueSpecies: 0,
      uniqueMedia: 0,
      totalIndividuals: 0,
      earliestDate: null,
      latestDate: null,
    };

    const calendarMap = {};
    calendarData.forEach((d) => {
      calendarMap[d.date] = d.count;
    });

    const enrichedTopSpecies = await enrichWithCommonNames(topSpecies);

    return NextResponse.json({
      stats,
      topSpecies: enrichedTopSpecies,
      monthlyTrend,
      calendar: calendarMap,
    });
  } catch (error) {
    console.error("Wildlife overview analytics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
