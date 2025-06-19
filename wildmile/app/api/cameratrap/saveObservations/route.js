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

    const observationsWithCreator = observations.map((obs) => {
      const observationData = {
        ...obs, // Spread existing fields like mediaId, taxonId, etc.
        creator: session._id,
      };

      // Explicitly include bounding box fields if they exist
      if (obs.bboxX !== undefined) observationData.bboxX = obs.bboxX;
      if (obs.bboxY !== undefined) observationData.bboxY = obs.bboxY;
      if (obs.bboxWidth !== undefined) observationData.bboxWidth = obs.bboxWidth;
      if (obs.bboxHeight !== undefined) observationData.bboxHeight = obs.bboxHeight;

      // For 'blank', 'human', 'vehicle' types, these fields might not be present.
      // If they are not in 'obs', they won't be added to 'observationData',
      // and Mongoose will handle them as per schema (likely storing them as undefined or default).

      return observationData;
    });

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
