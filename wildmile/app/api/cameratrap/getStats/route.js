import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import Observation from "models/cameratrap/Observation";
import User from "models/User";

export async function GET(request) {
  await dbConnect();

  try {
    // Get the search params to check if this is a forced refresh
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("force") === "true";

    // Get total images
    const totalImages = await CameratrapMedia.countDocuments();

    // Get unique mediaIds in observations
    const uniqueMediaIdsWithObservations = await Observation.distinct("mediaId");

    // Get total images with validated observations
    const validatedObservations = await Observation.aggregate([
      {
        $group: {
          _id: {
            mediaId: "$mediaId",
            scientificName: "$scientificName",
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gte: 2 },
        },
      },
      {
        $group: {
          _id: "$_id.mediaId",
        },
      },
      {
        $count: "count",
      },
    ]);

    // Get total number of volunteers
    const totalVolunteers = await Observation.distinct("creator");

    const response = NextResponse.json({
      totalImages,
      totalImagesWithObservations: uniqueMediaIdsWithObservations.length,
      totalValidatedImages: validatedObservations[0]?.count || 0,
      totalVolunteers: totalVolunteers.length,
    });

    // Set cache control headers
    response.headers.set(
      "Cache-Control",
      forceRefresh
        ? "no-store"
        : "public, s-maxage=3600, stale-while-revalidate=3600"
    );

    return response;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Error fetching statistics" },
      { status: 500 }
    );
  }
}
