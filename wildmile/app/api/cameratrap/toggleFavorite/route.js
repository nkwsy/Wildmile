import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

export async function POST(request) {
  await dbConnect();
  const session = await getSession({ headers });

  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { mediaId } = await request.json();

    const media = await CameratrapMedia.findOne({ mediaID: mediaId });
    if (!media) {
      return NextResponse.json({ message: "Media not found" }, { status: 404 });
    }

    const userIndex = media.favorites.indexOf(session._id);
    if (userIndex === -1) {
      media.favorites.push(session._id);
      media.favoriteCount += 1;
    } else {
      media.favorites.splice(userIndex, 1);
      media.favoriteCount -= 1;
    }

    media.favorite = media.favorites.includes(session._id);
    await media.save();

    return NextResponse.json(
      { favorite: media.favorite, favoriteCount: media.favoriteCount },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error toggling favorite:", error);
    return NextResponse.json(
      { message: "Error toggling favorite" },
      { status: 500 }
    );
  }
}
