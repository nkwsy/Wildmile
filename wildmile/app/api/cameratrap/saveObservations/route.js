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
      // The ...obs spread operator will carry over all fields from the incoming observation,
      // including the `boundingBoxes` array if it's present.
      // The Mongoose model `Observation.js` is expected to have the `boundingBoxes` field
      // defined as an array of objects, each with bboxX, bboxY, bboxWidth, bboxHeight.
      const observationData = {
        ...obs,
        creator: session._id,
      };

      // If obs.boundingBoxes is not present (e.g. for 'blank' images or if no boxes drawn),
      // it will simply not be part of observationData, and Mongoose will store it as undefined
      // or an empty array if the schema has `default: []` for `boundingBoxes`.
      // No explicit check or manipulation of boundingBoxes is needed here if the frontend
      // sends it correctly structured and the Mongoose model expects it.

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
