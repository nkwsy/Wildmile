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
    const { mediaId, comment } = await request.json();
    if (typeof mediaId !== "string" || typeof comment !== "string" || !comment.trim()) {
      return NextResponse.json(
        { message: "mediaId and a non-empty comment are required" },
        { status: 400 }
      );
    }

    const newComment = {
      text: comment,
      author: session._id,
      timestamp: new Date(),
    };

    // Atomic push. The previous findOne → push → save() re-wrote the whole
    // document (including schema defaults for any missing fields), which could
    // clobber a concurrent consensus update from saveObservations.
    const result = await CameratrapMedia.updateOne(
      { mediaID: mediaId },
      { $push: { mediaComments: newComment } }
    );
    if (result.matchedCount === 0) {
      return NextResponse.json({ message: "Media not found" }, { status: 404 });
    }

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { message: "Error adding comment" },
      { status: 500 }
    );
  }
}
