import { cache } from "react";

const fetchSpeciesData = cache(async (species) => {
  try {
    const response = await fetch(
      `https://api.inaturalist.org/v1/taxa?q=${encodeURIComponent(
        species
      )}&limit=1`,
      { next: { revalidate: 360000 } } // Cache for 10 hours
    );
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }
  } catch (error) {
    console.error("Error fetching species data:", error);
  }
  return null;
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const species = searchParams.get("species");

  if (!species) {
    return new Response(
      JSON.stringify({ error: "Species parameter is required" }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const data = await fetchSpeciesData(species);

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
