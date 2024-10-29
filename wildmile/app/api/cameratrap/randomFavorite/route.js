import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function GET() {
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

    return NextResponse.json(randomFavorite[0]);
  } catch (error) {
    console.error("Error fetching random favorite:", error);
    return NextResponse.json(
      { message: "Error fetching random favorite" },
      { status: 500 }
    );
  }
}
