import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import Species from "models/Species";

// Force dynamic rendering and disable caching
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    await dbConnect();

    const recentSpecies = await Observation.aggregate([
      // Only include animal observations
      {
        $match: {
          observationType: "animal",
          scientificName: { $exists: true, $ne: "" },
        },
      },

      // Sort by createdAt descending to get most recent first
      { $sort: { createdAt: -1 } },

      // Limit to last 50 observations
      { $limit: 50 },

      // Group by species to get unique entries with most recent date
      {
        $group: {
          _id: "$scientificName",
          lastSeen: { $first: "$createdAt" },
        },
      },

      // Format the output
      {
        $project: {
          _id: 0,
          species: "$_id",
          lastSeen: 1,
        },
      },

      // Sort by most recent first
      { $sort: { lastSeen: -1 } },

      // Get top 12 unique species
      { $limit: 12 },
    ]);

    // Fetch full species details for each recent species
    const speciesDetails = await Promise.all(
      recentSpecies.map(async (recent) => {
        const species = await Species.findOne({
          name: new RegExp(recent.species, "i"),
        });

        if (!species) {
          try {
            // Try to fetch from iNaturalist if not in our database
            const fetchedSpecies = await Species.findOrFetchByName(
              recent.species
            );
            if (fetchedSpecies) {
              return fetchedSpecies;
            }
          } catch (error) {
            console.warn(
              `Could not fetch species details for ${recent.species}:`,
              error
            );
            return null;
          }
        } else {
          return species;
        }
      })
    );

    // Filter out any null results and format response
    const formattedResults = speciesDetails.filter(Boolean);

    return NextResponse.json(formattedResults, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
      },
    });
  } catch (error) {
    console.error("Error fetching recent species:", error);
    return NextResponse.json(
      { error: "Error fetching recent species" },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  }
}
