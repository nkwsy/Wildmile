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

  try {
    const match = buildMatchStage(searchParams);

    const speciesCounts = await Observation.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$scientificName",
          observationCount: { $sum: 1 },
          individuals: { $sum: { $ifNull: ["$count", 1] } },
          uniqueMedia: { $addToSet: "$mediaId" },
          uniqueDeployments: { $addToSet: "$deploymentId" },
          firstSeen: { $min: "$eventStart" },
          lastSeen: { $max: "$eventStart" },
        },
      },
      { $sort: { observationCount: 1 } },
      {
        $project: {
          _id: 0,
          species: "$_id",
          observationCount: 1,
          individuals: 1,
          mediaCount: { $size: "$uniqueMedia" },
          locationCount: { $size: "$uniqueDeployments" },
          firstSeen: 1,
          lastSeen: 1,
        },
      },
    ]).option({ allowDiskUse: true });

    const totalObservations = speciesCounts.reduce(
      (sum, s) => sum + s.observationCount,
      0
    );
    const totalSpecies = speciesCounts.length;

    // Shannon diversity index: H = -sum(pi * ln(pi))
    let shannonIndex = 0;
    if (totalObservations > 0) {
      speciesCounts.forEach((s) => {
        const pi = s.observationCount / totalObservations;
        if (pi > 0) shannonIndex -= pi * Math.log(pi);
      });
    }

    // Simpson's diversity: D = 1 - sum(pi^2)
    let simpsonsIndex = 0;
    if (totalObservations > 0) {
      let sumPi2 = 0;
      speciesCounts.forEach((s) => {
        const pi = s.observationCount / totalObservations;
        sumPi2 += pi * pi;
      });
      simpsonsIndex = 1 - sumPi2;
    }

    // Evenness: J = H / ln(S)
    const evenness =
      totalSpecies > 1 ? shannonIndex / Math.log(totalSpecies) : 0;

    // Resolve common names
    const nameMap = await resolveCommonNames(
      speciesCounts.map((s) => s.species)
    );

    // Mark rarity
    const rarityThreshold = totalObservations * 0.01;
    const speciesWithRarity = speciesCounts.map((s) => ({
      ...s,
      commonName: nameMap.get(s.species) || null,
      relativeAbundance: +(
        (s.observationCount / totalObservations) *
        100
      ).toFixed(2),
      isRare: s.observationCount <= Math.max(rarityThreshold, 2),
      isSingleton: s.observationCount === 1,
    }));

    const rareSpecies = speciesWithRarity.filter((s) => s.isRare);
    const singletons = speciesWithRarity.filter((s) => s.isSingleton);

    return NextResponse.json({
      species: speciesWithRarity,
      diversity: {
        shannonIndex: +shannonIndex.toFixed(3),
        simpsonsIndex: +simpsonsIndex.toFixed(3),
        evenness: +evenness.toFixed(3),
        totalSpecies,
        totalObservations,
        rareSpeciesCount: rareSpecies.length,
        singletonCount: singletons.length,
      },
    });
  } catch (error) {
    console.error("Wildlife rarity analytics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
