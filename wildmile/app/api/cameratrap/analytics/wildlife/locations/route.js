import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import CameratrapDeployment from "models/cameratrap/Deployment";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";
import resolveCommonNames from "lib/wildlife/resolveCommonNames";

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

    // Build deployment -> location mapping with populated location details
    const deployments = await CameratrapDeployment.find(
      {},
      { _id: 1, locationName: 1, locationId: 1, location: 1 }
    )
      .populate({
        path: "locationId",
        select: "locationName zone projectArea location",
      })
      .lean();

    const deploymentMap = {};
    deployments.forEach((d) => {
      const loc = d.locationId;
      const isPopulated = loc && typeof loc === "object";
      const name =
        d.locationName ||
        (isPopulated ? loc.locationName : null) ||
        "Unknown";
      const zone = isPopulated ? loc.zone || null : null;
      const projectArea = isPopulated ? loc.projectArea || null : null;
      const coordinates =
        (isPopulated && loc.location?.coordinates) ||
        d.location?.coordinates ||
        null;
      deploymentMap[d._id.toString()] = {
        name,
        zone,
        projectArea,
        coordinates,
      };
    });

    // Try observations that have deploymentId directly
    let perDeployment = await Observation.aggregate([
      { $match: { ...match, deploymentId: { $ne: null } } },
      {
        $group: {
          _id: { deploymentId: "$deploymentId", species: "$scientificName" },
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
    ]);

    // If no direct deployment links, resolve through media
    if (perDeployment.length === 0) {
      perDeployment = await Observation.aggregate([
        { $match: match },
        {
          $lookup: {
            from: "cameratrapmedias",
            localField: "mediaId",
            foreignField: "mediaID",
            as: "media",
            pipeline: [{ $project: { deploymentId: 1, _id: 0 } }],
          },
        },
        { $unwind: { path: "$media", preserveNullAndEmptyArrays: false } },
        { $match: { "media.deploymentId": { $ne: null } } },
        {
          $group: {
            _id: {
              deploymentId: "$media.deploymentId",
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
      ]);
    }

    if (perDeployment.length === 0) {
      return NextResponse.json({ locations: [] });
    }

    const locations = perDeployment.map((d) => {
      const depId = d._id.toString();
      const locInfo = deploymentMap[depId] || {
        name: "Unknown",
        zone: null,
        projectArea: null,
      };

      let shannon = 0;
      d.species.forEach((s) => {
        const pi = s.count / d.totalObservations;
        if (pi > 0) shannon -= pi * Math.log(pi);
      });

      const topSpecies = d.species
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      return {
        deploymentId: depId,
        locationName: locInfo.name,
        zone: locInfo.zone,
        projectArea: locInfo.projectArea,
        coordinates: locInfo.coordinates,
        totalObservations: d.totalObservations,
        speciesCount: d.speciesCount,
        shannonDiversity: +shannon.toFixed(3),
        topSpecies,
      };
    });

    // Merge by location name
    const merged = {};
    locations.forEach((loc) => {
      if (!merged[loc.locationName]) {
        merged[loc.locationName] = {
          locationName: loc.locationName,
          zone: loc.zone,
          projectArea: loc.projectArea,
          coordinates: loc.coordinates,
          totalObservations: 0,
          speciesSet: new Set(),
          speciesCounts: {},
          deploymentIds: [],
        };
      }
      const m = merged[loc.locationName];
      m.totalObservations += loc.totalObservations;
      m.deploymentIds.push(loc.deploymentId);
      if (!m.zone && loc.zone) m.zone = loc.zone;
      if (!m.projectArea && loc.projectArea) m.projectArea = loc.projectArea;
      if (!m.coordinates && loc.coordinates) m.coordinates = loc.coordinates;
      loc.topSpecies.forEach((s) => {
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

    const allSpeciesNames = [
      ...new Set(
        mergedLocations.flatMap((l) => l.topSpecies.map((s) => s.name))
      ),
    ];
    const nameMap = await resolveCommonNames(allSpeciesNames);

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
