import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    const randomFavorite = await CameratrapMedia.aggregate([
      { $match: { favorite: true } },
      { $sample: { size: 1 } },
      {
        $lookup: {
          from: "users",
          localField: "favorites",
          foreignField: "_id",
          as: "favoriteUsers",
        },
      },
    ]).exec();

    if (!randomFavorite || randomFavorite.length === 0) {
      return NextResponse.json(
        { message: "No favorite images found" },
        { status: 404 },
      );
    }

    return NextResponse.json(randomFavorite[0], {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error) {
    console.error("Error fetching random favorite:", error);
    return NextResponse.json(
      { message: "Error fetching random favorite" },
      { status: 500 },
    );
  }
}
