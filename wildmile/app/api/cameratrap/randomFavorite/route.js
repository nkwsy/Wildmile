import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request) {
  try {
    await dbConnect();

    // Use the randomSeed index for O(log n) random lookup instead of
    // the O(n) $sample-after-$match aggregation.
    const randomFavorite = await CameratrapMedia.findOneRandom({
      favorite: true,
    });

    if (!randomFavorite) {
      return NextResponse.json(
        { message: "No favorite images found" },
        { status: 404 }
      );
    }

    // Populate the favoriteUsers field (replaces the $lookup stage)
    await CameratrapMedia.populate(randomFavorite, {
      path: "favorites",
      model: "User",
    });
    randomFavorite.favoriteUsers = randomFavorite.favorites;

    const { searchParams } = new URL(request.url);
    const refresh = searchParams.has("refresh");

    return NextResponse.json(randomFavorite, {
      headers: {
        "Cache-Control": refresh
          ? "no-cache"
          : "public, s-maxage=120, stale-while-revalidate=60",
      },
    });
  } catch (error) {
    console.error("Error fetching random favorite:", error);
    return NextResponse.json(
      { message: "Error fetching random favorite" },
      { status: 500 }
    );
  }
}
