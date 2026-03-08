import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import resolveCommonNames from "lib/wildlife/resolveCommonNames";

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
  const limit = parseInt(searchParams.get("limit") || "15", 10);

  try {
    const match = buildMatchStage(searchParams);

    // Group species per media to find co-occurrences
    const mediaSpecies = await Observation.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$mediaId",
          species: { $addToSet: "$scientificName" },
        },
      },
      { $match: { "species.1": { $exists: true } } },
    ]).option({ allowDiskUse: true });

    // Build co-occurrence counts and per-species media counts
    const pairCounts = {};
    const speciesMediaCounts = {};

    mediaSpecies.forEach(({ species }) => {
      species.forEach((s) => {
        speciesMediaCounts[s] = (speciesMediaCounts[s] || 0) + 1;
      });

      const sorted = [...species].sort();
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          const key = `${sorted[i]}|||${sorted[j]}`;
          pairCounts[key] = (pairCounts[key] || 0) + 1;
        }
      }
    });

    // Get total media per species (including solo appearances)
    const allSpeciesMedia = await Observation.aggregate([
      { $match: match },
      { $group: { _id: "$scientificName", mediaIds: { $addToSet: "$mediaId" } } },
      { $project: { _id: 0, species: "$_id", mediaCount: { $size: "$mediaIds" } } },
    ]).option({ allowDiskUse: true });

    const totalMediaMap = {};
    allSpeciesMedia.forEach((s) => {
      totalMediaMap[s.species] = s.mediaCount;
    });

    // Build pairs with Jaccard index
    const pairs = Object.entries(pairCounts)
      .map(([key, count]) => {
        const [speciesA, speciesB] = key.split("|||");
        const mediaA = totalMediaMap[speciesA] || 0;
        const mediaB = totalMediaMap[speciesB] || 0;
        const union = mediaA + mediaB - count;
        const jaccard = union > 0 ? +(count / union).toFixed(3) : 0;
        return { speciesA, speciesB, count, jaccard };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    // Build matrix for top N species
    const topSpecies = Object.entries(totalMediaMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([s]) => s);

    const matrix = {};
    topSpecies.forEach((a) => {
      matrix[a] = {};
      topSpecies.forEach((b) => {
        matrix[a][b] = 0;
      });
    });

    Object.entries(pairCounts).forEach(([key, count]) => {
      const [a, b] = key.split("|||");
      if (matrix[a] && matrix[a][b] !== undefined) matrix[a][b] = count;
      if (matrix[b] && matrix[b][a] !== undefined) matrix[b][a] = count;
    });

    // Fill diagonal with self-count
    topSpecies.forEach((s) => {
      matrix[s][s] = totalMediaMap[s] || 0;
    });

    // Resolve common names for all species in the matrix + pairs
    const allNames = [
      ...topSpecies,
      ...pairs.flatMap((p) => [p.speciesA, p.speciesB]),
    ];
    const nameMap = await resolveCommonNames([...new Set(allNames)]);
    const commonNames = {};
    nameMap.forEach((common, sci) => {
      commonNames[sci] = common;
    });

    const enrichedPairs = pairs.slice(0, 20).map((p) => ({
      ...p,
      commonNameA: commonNames[p.speciesA] || null,
      commonNameB: commonNames[p.speciesB] || null,
    }));

    return NextResponse.json({
      pairs: enrichedPairs,
      matrix,
      speciesOrder: topSpecies,
      commonNames,
    });
  } catch (error) {
    console.error("Wildlife co-occurrence analytics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
