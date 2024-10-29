import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function GET(request) {
  await dbConnect();

  try {
    // Find a random document where favorite is true
    const randomFavorite = await CameratrapMedia.aggregate([
      { $match: { favorite: true } },
      { $sample: { size: 1 } },
    ]);

    if (!randomFavorite || randomFavorite.length === 0) {
      return NextResponse.json(
        { message: "No favorite images found" },
        { status: 404 }
      );
    }

    // Set Cache-Control to prevent caching
    const response = NextResponse.json(randomFavorite[0]);
    response.headers.set(
      "Cache-Control",
      "no-cache, no-store, must-revalidate"
    );
    return response;
  } catch (error) {
    console.error("Error fetching random favorite:", error);
    return NextResponse.json(
      { message: "Error fetching random favorite" },
      { status: 500 }
    );
  }
}
