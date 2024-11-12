import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import { getSession } from "lib/getSession";

export async function POST(request) {
  try {
    await dbConnect();
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { mediaId } = await request.json();

    if (!mediaId) {
      return NextResponse.json(
        { error: "Media ID is required" },
        { status: 400 }
      );
    }

    const media = await CameratrapMedia.findOne({ mediaID: mediaId });

    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    // Toggle the needsReview status
    media.needsReview = !media.needsReview;
    await media.save();

    return NextResponse.json({ needsReview: media.needsReview });
  } catch (error) {
    console.error("Error toggling needs review:", error);
    return NextResponse.json(
      { error: "Failed to toggle needs review status" },
      { status: 500 }
    );
  }
}
