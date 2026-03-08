import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import CameratrapDeployment from "models/cameratrap/Deployment";
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

    // Get deployment-to-location mapping
    const deployments = await CameratrapDeployment.find(
      {},
      { _id: 1, locationName: 1, locationId: 1 }
    ).lean();

    const deploymentMap = {};
    deployments.forEach((d) => {
      deploymentMap[d._id.toString()] =
        d.locationName || d.locationId?.toString() || "Unknown";
    });

    // Aggregate observations by deployment
    const perDeployment = await Observation.aggregate([
      { $match: { ...match, deploymentId: { $ne: null } } },
      {
        $group: {
          _id: {
            deploymentId: "$deploymentId",
            species: "$scientificName",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.deploymentId",
          species: {
            $push: { name: "$_id.species", count: "$count" },
          },
          totalObservations: { $sum: "$count" },
          speciesCount: { $sum: 1 },
        },
      },
      { $sort: { totalObservations: -1 } },
    ]);

    const locations = perDeployment.map((d) => {
      const depId = d._id.toString();
      const locationName = deploymentMap[depId] || "Unknown";

      // Shannon diversity per location
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
        locationName,
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
          totalObservations: 0,
          speciesSet: new Set(),
          speciesCounts: {},
          deploymentIds: [],
        };
      }
      const m = merged[loc.locationName];
      m.totalObservations += loc.totalObservations;
      m.deploymentIds.push(loc.deploymentId);
      loc.topSpecies.forEach((s) => {
        m.speciesSet.add(s.name);
        m.speciesCounts[s.name] =
          (m.speciesCounts[s.name] || 0) + s.count;
      });
    });

    const mergedLocations = Object.values(merged)
      .map((m) => {
        let shannon = 0;
        const total = Object.values(m.speciesCounts).reduce((a, b) => a + b, 0);
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
          totalObservations: m.totalObservations,
          speciesCount: m.speciesSet.size,
          shannonDiversity: +shannon.toFixed(3),
          topSpecies,
        };
      })
      .sort((a, b) => b.totalObservations - a.totalObservations);

    // Resolve common names for top species across all locations
    const allSpeciesNames = [
      ...new Set(mergedLocations.flatMap((l) => l.topSpecies.map((s) => s.name))),
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
