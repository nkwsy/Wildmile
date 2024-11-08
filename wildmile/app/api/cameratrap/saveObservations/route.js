import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import CameratrapMedia from "models/cameratrap/Media";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

export async function POST(request) {
  await dbConnect();
  const session = await getSession({ headers });

  try {
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const observations = await request.json();
    const mediaId = observations[0]?.mediaId;

    // If this user has already reviewed this media, delete their previous observations
    if (mediaId) {
      const media = await CameratrapMedia.findOne({ mediaID: mediaId });
      if (media?.reviewers?.includes(session._id)) {
        await Observation.deleteMany({
          mediaId,
          creator: session._id,
        });
      }
    }

    const observationsWithCreator = observations.map((obs) => ({
      ...obs,
      creator: session._id,
    }));

    const savedObservations = await Observation.insertMany(
      observationsWithCreator
    );

    // Update consensus for each media
    for (const observation of savedObservations) {
      await CameratrapMedia.addObservationAndUpdateConsensusForMedia(
        observation.mediaId,
        { _id: observation._id, creator: observation.creator }
      );
    }

    return NextResponse.json(
      {
        message: "Observations saved successfully and consensus updated",
        count: savedObservations.length,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error saving observations:", error);
    return NextResponse.json(
      { message: "Error saving observations" },
      { status: 500 }
    );
  }
}
