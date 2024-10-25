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

    const media = await CameratrapMedia.findOne({ mediaID: mediaId });
    if (!media) {
      return NextResponse.json({ message: "Media not found" }, { status: 404 });
    }

    const newComment = {
      text: comment,
      author: session._id,
      timestamp: new Date(),
    };

    media.mediaComments.push(newComment);
    await media.save();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { message: "Error adding comment" },
      { status: 500 }
    );
  }
}
