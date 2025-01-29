import { NextResponse } from "next/server";
import dbConnect from "/lib/db/setup";
import Species from "/models/Species";
import { unstable_cache } from "next/cache";

export async function GET(request) {
  await dbConnect();
  const { searchParams } = new URL(request.url);
  const species = searchParams.get("species");
  const id = searchParams.get("id");

  if (!species && !id) {
    return NextResponse.json(
      { error: "Species or ID parameter is required" },
      { status: 400 }
    );
  }

  try {
    let result;

    if (id) {
      result = await Species.findById(id);
    } else {
      // Cache the findOrFetchByName results
      const getCachedSpecies = unstable_cache(
        async (speciesName) => {
          return Species.findOne({ name: speciesName });
        },
        [`species-${species}`],
        {
          revalidate: 36000, // Cache for 1 hour
          tags: ["species"],
        }
      );

      result = await getCachedSpecies(species);

      //       { status: 500 }
      //     );
      //   }

      if (!result) {
        try {
          result = await Species.findOrFetchByName(species);
        } catch (fetchError) {
          console.error("Error fetching species:", fetchError);
          return NextResponse.json(
            { error: "Species not found" },
            { status: 404 }
          );
        }
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in species route:", error);
    return NextResponse.json(
      { error: "Error processing request" },
      { status: 500 }
    );
  }
}
