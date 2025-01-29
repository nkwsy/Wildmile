import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Species from "/models/Species";
import { predefinedSpecies } from "/utils/predefinedSpecies";

// Revalidate this endpoint's data after one hour (3600 seconds):
export const revalidate = 3600;

// Force dynamic rendering (in case you need that):
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // Flatten all species from the predefinedSpecies object
    const allSpeciesNames = Object.values(predefinedSpecies).flat();

    // Let your model fetch them or create them in DB (like your findOrFetchMany)
    const speciesDocs = await Species.findOrFetchMany(allSpeciesNames);

    // At this point you have an array of species documents.
    // Convert them all to a "card" format if desired,
    // or just return them directly.
    // const data = speciesDocs.map((doc) => doc.toCardFormat());

    return NextResponse.json(speciesDocs, { status: 200 });
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Error fetching species data" },
      { status: 500 }
    );
  }
}
