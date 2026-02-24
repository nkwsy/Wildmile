import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import dbConnect from "lib/db/setup";
import Species from "/models/Species";
import { predefinedSpecies } from "/utils/predefinedSpecies";

export const dynamic = "force-dynamic";

const getCachedSpecies = unstable_cache(
  async () => {
    await dbConnect();
    const allSpeciesNames = Object.values(predefinedSpecies).flat();
    const speciesDocs = await Species.findOrFetchMany(allSpeciesNames);
    return JSON.parse(JSON.stringify(speciesDocs));
  },
  ["predefined-species"],
  { revalidate: 3600 },
);

export async function GET() {
  try {
    const speciesDocs = await getCachedSpecies();
    return NextResponse.json(speciesDocs, { status: 200 });
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Error fetching species data" },
      { status: 500 },
    );
  }
}
