import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // Aggregate species data efficiently
    const stats = await CameratrapMedia.aggregate([
      // Only include media with consensus reached
      { $match: { consensusStatus: "Pending" } },

      // Unwind the species consensus array
      { $unwind: "$speciesConsensus" },

      // Only include animal observations
      { $match: { "speciesConsensus.observationType": "animal" } },

      // Group by species
      {
        $group: {
          _id: "$speciesConsensus.scientificName",
          count: { $sum: 1 },
          lastSeen: { $max: "$timestamp" },
        },
      },

      // Format the output
      {
        $project: {
          _id: 0,
          species: "$_id",
          count: 1,
          lastSeen: 1,
        },
      },

      // Sort by count descending
      { $sort: { count: -1 } },
    ]);

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching species stats:", error);
    return NextResponse.json(
      { error: "Error fetching species stats" },
      { status: 500 }
    );
  }
}
