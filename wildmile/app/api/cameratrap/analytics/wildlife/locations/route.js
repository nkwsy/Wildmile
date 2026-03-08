import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import CameratrapDeployment from "models/cameratrap/Deployment";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";
import resolveCommonNames from "lib/wildlife/resolveCommonNames";

export const maxDuration = 30;

function buildMatchStage(searchParams) {
  const match = { observationType: "animal", scientificName: { $ne: null } };
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  if (startDate || endDate) {
    match.eventStart = {};
    if (startDate) match.eventStart.$gte = new Date(startDate);
    if (endDate) match.eventStart.$lte = new Date(endDate);
  }
  return match;
}

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);

  try {
    const match = buildMatchStage(searchParams);

    // Single aggregation: group observations by deployment, resolving
    // deployment through media when observation.deploymentId is null.
    const perDeployment = await Observation.aggregate([
      { $match: match },
      {
        $lookup: {
          from: "cameratrapmedias",
          localField: "mediaId",
          foreignField: "mediaID",
          as: "_media",
          pipeline: [{ $project: { deploymentId: 1 } }],
        },
      },
      {
        $addFields: {
          _resolvedDeploymentId: {
            $ifNull: [
              "$deploymentId",
              { $arrayElemAt: ["$_media.deploymentId", 0] },
            ],
          },
        },
      },
      { $match: { _resolvedDeploymentId: { $ne: null } } },
      {
        $group: {
          _id: {
            deploymentId: "$_resolvedDeploymentId",
            species: "$scientificName",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.deploymentId",
          species: { $push: { name: "$_id.species", count: "$count" } },
          totalObservations: { $sum: "$count" },
          speciesCount: { $sum: 1 },
        },
      },
      { $sort: { totalObservations: -1 } },
      { $limit: 100 },
    ]).option({ allowDiskUse: true });

    if (perDeployment.length === 0) {
      return NextResponse.json({ locations: [] });
    }

    // Only fetch deployments that appear in results
    const depIds = perDeployment.map((d) => d._id);
    const deployments = await CameratrapDeployment.find(
      { _id: { $in: depIds } },
      { _id: 1, locationName: 1, locationId: 1, location: 1 }
    ).lean();

    // Batch-fetch referenced DeploymentLocations
    const locationIds = [
      ...new Set(
        deployments
          .map((d) => d.locationId?.toString())
          .filter(Boolean)
      ),
    ];
    const depLocations =
      locationIds.length > 0
        ? await DeploymentLocation.find(
            { _id: { $in: locationIds } },
            { locationName: 1, zone: 1, projectArea: 1, location: 1 }
          ).lean()
        : [];

    const locMap = {};
    depLocations.forEach((l) => {
      locMap[l._id.toString()] = l;
    });

    const deploymentMap = {};
    deployments.forEach((d) => {
      const loc = d.locationId ? locMap[d.locationId.toString()] : null;
      deploymentMap[d._id.toString()] = {
        name: d.locationName || loc?.locationName || "Unknown",
        zone: loc?.zone || null,
        projectArea: loc?.projectArea || null,
        coordinates:
          loc?.location?.coordinates || d.location?.coordinates || null,
      };
    });

    // Build location results and merge by name
    const merged = {};
    perDeployment.forEach((d) => {
      const depId = d._id.toString();
      const info = deploymentMap[depId] || {
        name: "Unknown",
        zone: null,
        projectArea: null,
        coordinates: null,
      };

      if (!merged[info.name]) {
        merged[info.name] = {
          locationName: info.name,
          zone: info.zone,
          projectArea: info.projectArea,
          coordinates: info.coordinates,
          totalObservations: 0,
          speciesSet: new Set(),
          speciesCounts: {},
        };
      }
      const m = merged[info.name];
      m.totalObservations += d.totalObservations;
      if (!m.zone && info.zone) m.zone = info.zone;
      if (!m.projectArea && info.projectArea) m.projectArea = info.projectArea;
      if (!m.coordinates && info.coordinates) m.coordinates = info.coordinates;
      d.species.forEach((s) => {
        m.speciesSet.add(s.name);
        m.speciesCounts[s.name] = (m.speciesCounts[s.name] || 0) + s.count;
      });
    });

    const mergedLocations = Object.values(merged)
      .map((m) => {
        let shannon = 0;
        const total = Object.values(m.speciesCounts).reduce(
          (a, b) => a + b,
          0
        );
        Object.values(m.speciesCounts).forEach((c) => {
          const pi = c / total;
          if (pi > 0) shannon -= pi * Math.log(pi);
        });

        const topSpecies = Object.entries(m.speciesCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, count]) => ({ name, count }));

        return {
          locationName: m.locationName,
          zone: m.zone || null,
          projectArea: m.projectArea || null,
          coordinates: m.coordinates || null,
          totalObservations: m.totalObservations,
          speciesCount: m.speciesSet.size,
          shannonDiversity: +shannon.toFixed(3),
          topSpecies,
        };
      })
      .sort((a, b) => b.totalObservations - a.totalObservations);

    // Resolve common names (only for top species already in DB -- skip iNat fetch)
    const allSpeciesNames = [
      ...new Set(
        mergedLocations.flatMap((l) => l.topSpecies.map((s) => s.name))
      ),
    ];

    let nameMap = new Map();
    try {
      const Species = (await import("models/Species")).default;
      const existing = await Species.find(
        { name: { $in: allSpeciesNames } },
        { name: 1, preferred_common_name: 1, common_name: 1 }
      ).lean();
      existing.forEach((s) => {
        nameMap.set(s.name, s.preferred_common_name || s.common_name || null);
      });
    } catch {
      // Species model not available, skip common names
    }

    const enrichedLocations = mergedLocations.map((loc) => ({
      ...loc,
      topSpecies: loc.topSpecies.map((s) => ({
        ...s,
        commonName: nameMap.get(s.name) || null,
      })),
    }));

    return NextResponse.json({ locations: enrichedLocations });
  } catch (error) {
    console.error("Wildlife locations analytics error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
