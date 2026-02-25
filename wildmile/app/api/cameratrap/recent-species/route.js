import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import Species from "models/Species";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET() {
  try {
    await dbConnect();

    // Aggregate recent animal observations, grouped by species.
    // Uses the { observationType: 1, scientificName: 1, createdAt: -1 } index.
    const recentSpecies = await Observation.aggregate([
      {
        $match: {
          observationType: "animal",
          scientificName: { $exists: true, $ne: "" },
        },
      },
      // Group first to avoid sorting the entire collection.
      // $last with natural insertion order approximates recency
      // without a full sort on millions of docs.
      {
        $group: {
          _id: "$scientificName",
          lastSeen: { $max: "$createdAt" },
        },
      },
      { $sort: { lastSeen: -1 } },
      { $limit: 12 },
      {
        $project: {
          _id: 0,
          species: "$_id",
          lastSeen: 1,
        },
      },
    ]);

    // Batch-fetch all species from our DB in one query instead of 12 individual calls.
    // Uses a case-insensitive match via $in with exact names (faster than RegExp).
    const speciesNames = recentSpecies.map((r) => r.species);
    const existingSpecies = await Species.find({
      name: { $in: speciesNames },
    }).lean();

    // Build a lookup map: lowercase name -> species doc
    const speciesMap = new Map(
      existingSpecies.map((s) => [s.name.toLowerCase(), s])
    );

    // For any species not already in our DB, try fetching from iNaturalist.
    // These external API calls run in parallel.
    const missingNames = speciesNames.filter(
      (name) => !speciesMap.has(name.toLowerCase())
    );

    if (missingNames.length > 0) {
      const fetched = await Promise.all(
        missingNames.map(async (name) => {
          try {
            return await Species.findOrFetchByName(name);
          } catch (error) {
            console.warn(`Could not fetch species details for ${name}:`, error);
            return null;
          }
        })
      );
      fetched.filter(Boolean).forEach((s) => {
        speciesMap.set(s.name.toLowerCase(), s);
      });
    }

    // Return species in the same order as the aggregation results
    const formattedResults = speciesNames
      .map((name) => speciesMap.get(name.toLowerCase()))
      .filter(Boolean);

    // Cache for 5 minutes — recent species don't change moment to moment
    return NextResponse.json(formattedResults, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching recent species:", error);
    return NextResponse.json(
      { error: "Error fetching recent species" },
      { status: 500 }
    );
  }
}
