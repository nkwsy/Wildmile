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
    if (!Array.isArray(observations) || observations.length === 0) {
      return NextResponse.json(
        { message: "Expected a non-empty array of observations" },
        { status: 400 }
      );
    }

    const observationsWithCreator = observations.map((obs) => ({
      ...obs,
      creator: session._id,
    }));

    const savedObservations = await Observation.insertMany(
      observationsWithCreator
    );

    // Recompute the summary once per media (normally exactly one), instead of
    // reloading + re-saving the full media document once per observation.
    const mediaIds = [
      ...new Set(savedObservations.map((o) => o.mediaId).filter(Boolean)),
    ];
    await Promise.all(
      mediaIds.map((mediaId) =>
        CameratrapMedia.recomputeConsensusForMedia(mediaId)
      )
    );

    const savedSpecies = [
      ...new Set(
        savedObservations
          .filter((o) => o.observationType === "animal" && o.scientificName)
          .map((o) => o.scientificName)
      ),
    ];

    return NextResponse.json(
      {
        message: "Observations saved successfully and consensus updated",
        count: savedObservations.length,
        savedSpecies,
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
