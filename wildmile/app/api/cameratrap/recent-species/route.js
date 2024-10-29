import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";

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

      // Get top 6 unique species
      { $limit: 6 },
    ]);

    return NextResponse.json(recentSpecies, {
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
