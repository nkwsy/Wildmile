import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import User from "models/User";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Get user info
    const user = await User.findById(userId, "profile roles");

    // Get all observations by the user
    const observations = await Observation.find({ creator: userId });

    // Calculate total images reviewed (unique media IDs)
    const uniqueMediaIds = new Set(observations.map((obs) => obs.mediaId));
    const totalImagesReviewed = uniqueMediaIds.size;

    // Calculate total animals observed
    const animalObservations = observations.filter(
      (obs) => obs.observationType === "animal"
    );
    const totalAnimalsObserved = animalObservations.reduce(
      (sum, obs) => sum + (obs.count || 1),
      0
    );

    // Calculate total blanks logged
    const totalBlanksLogged = observations.filter(
      (obs) => obs.observationType === "blank"
    ).length;

    // Calculate unique species
    const uniqueSpecies = new Set(
      animalObservations.map((obs) => obs.scientificName).filter((name) => name) // Remove null/undefined
    );

    // Get top species
    const speciesCounts = animalObservations.reduce((acc, obs) => {
      const key = obs.commonName || obs.scientificName;
      if (!acc[key]) {
        acc[key] = {
          commonName: obs.commonName,
          scientificName: obs.scientificName,
          count: 0,
        };
      }
      acc[key].count += obs.count || 1;
      return acc;
    }, {});

    const topSpecies = Object.values(speciesCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const stats = {
      user,
      totalImagesReviewed,
      totalAnimalsObserved,
      totalBlanksLogged,
      uniqueSpeciesCount: uniqueSpecies.size,
      topSpecies,
      lastActive:
        observations.length > 0
          ? Math.max(...observations.map((obs) => new Date(obs.createdAt)))
          : null,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 }
    );
  }
}
