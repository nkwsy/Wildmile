import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import resolveCommonNames from "lib/wildlife/resolveCommonNames";

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

    const [hourWeekMatrix, seasonalData, dielData] = await Promise.all([
      // Hour x Week-of-Year matrix
      Observation.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              hour: { $hour: "$eventStart" },
              week: { $isoWeek: "$eventStart" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            hour: "$_id.hour",
            week: "$_id.week",
            count: 1,
          },
        },
      ]).option({ allowDiskUse: true }),

      // Seasonal (monthly) breakdown by species
      Observation.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              month: { $month: "$eventStart" },
              species: "$scientificName",
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { count: -1 } },
        {
          $group: {
            _id: "$_id.month",
            species: {
              $push: { name: "$_id.species", count: "$count" },
            },
            total: { $sum: "$count" },
          },
        },
        { $sort: { _id: 1 } },
        {
          $project: {
            _id: 0,
            month: "$_id",
            species: { $slice: ["$species", 10] },
            total: 1,
          },
        },
      ]).option({ allowDiskUse: true }),

      // Diel activity per species (top 8 species, hourly)
      Observation.aggregate([
        { $match: match },
        {
          $group: {
            _id: {
              species: "$scientificName",
              hour: { $hour: "$eventStart" },
            },
            count: { $sum: 1 },
          },
        },
        {
          $group: {
            _id: "$_id.species",
            hours: {
              $push: { hour: "$_id.hour", count: "$count" },
            },
            total: { $sum: "$count" },
          },
        },
        { $sort: { total: -1 } },
        { $limit: 8 },
        {
          $project: {
            _id: 0,
            species: "$_id",
            hours: 1,
            total: 1,
          },
        },
      ]).option({ allowDiskUse: true }),
    ]);

    // Build hour x week-of-year matrix
    const weeksPresent = [...new Set(hourWeekMatrix.map((r) => r.week))].sort(
      (a, b) => a - b
    );
    const minWeek = weeksPresent.length ? weeksPresent[0] : 1;
    const maxWeek = weeksPresent.length ? weeksPresent[weeksPresent.length - 1] : 52;

    const matrix = [];
    for (let h = 0; h < 24; h++) {
      for (let w = minWeek; w <= maxWeek; w++) {
        const found = hourWeekMatrix.find(
          (item) => item.hour === h && item.week === w
        );
        matrix.push({
          hour: h,
          week: w,
          count: found ? found.count : 0,
        });
      }
    }

    // Resolve common names for diel species
    const dielSpeciesNames = dielData.map((s) => s.species);
    const nameMap = await resolveCommonNames(dielSpeciesNames);

    // Build full diel curves (fill missing hours with 0)
    const dielCurves = dielData.map((species) => {
      const hourMap = {};
      species.hours.forEach((h) => {
        hourMap[h.hour] = h.count;
      });
      const curve = Array.from({ length: 24 }, (_, i) => ({
        hour: i,
        count: hourMap[i] || 0,
      }));
      return {
        species: species.species,
        commonName: nameMap.get(species.species) || null,
        data: curve,
        total: species.total,
      };
    });

    // Build seasonal with month names
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const seasonal = seasonalData.map((m) => ({
      month: monthNames[m.month - 1],
      monthIndex: m.month,
      total: m.total,
      species: m.species,
    }));

    return NextResponse.json({ matrix, seasonal, dielCurves });
  } catch (error) {
    console.error("Wildlife temporal analytics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
