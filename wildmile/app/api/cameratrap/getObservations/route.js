import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";

import Observation from "models/cameratrap/Observation";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const mediaId = searchParams.get("mediaId");

  if (!mediaId) {
    return NextResponse.json(
      { error: "Media ID is required" },
      { status: 400 }
    );
  }

  try {
    const observations = await Observation.find({ mediaId })
      .populate("creator", "profile.name profile.image")
      .sort({ createdAt: -1 });

    return NextResponse.json(observations);
  } catch (error) {
    console.error("Error fetching observations:", error);
    return NextResponse.json(
      { error: "Failed to fetch observations" },
      { status: 500 }
    );
  }
}
