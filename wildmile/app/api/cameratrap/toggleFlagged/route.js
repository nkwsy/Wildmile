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

    // Toggle the flagged status
    media.flagged = !media.flagged;
    await media.save();

    return NextResponse.json({ flagged: media.flagged });
  } catch (error) {
    console.error("Error toggling flagged status:", error);
    return NextResponse.json(
      { error: "Failed to toggle flagged status" },
      { status: 500 }
    );
  }
}
