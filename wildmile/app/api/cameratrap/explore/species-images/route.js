import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export const dynamic = "force-dynamic";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const species = searchParams.get("species");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 20;
    const skip = (page - 1) * limit;

    await dbConnect();

    // Query for images with the specified species
    const query = {
      consensusStatus: "Pending",
      speciesConsensus: {
        $elemMatch: {
          observationType: "animal",
          scientificName: species,
        },
      },
    };

    // Get total count for pagination
    const total = await CameratrapMedia.countDocuments(query);

    // Get paginated results with necessary fields
    const images = await CameratrapMedia.find(query)
      .select("mediaID publicURL timestamp consensusStatus")
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit);

    return NextResponse.json({
      images,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("Error fetching species images:", error);
    return NextResponse.json(
      { error: "Error fetching species images" },
      { status: 500 }
    );
  }
}
