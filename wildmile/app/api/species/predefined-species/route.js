import { NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import dbConnect from "lib/db/setup";
import Species from "/models/Species";
import { predefinedSpecies } from "/utils/predefinedSpecies";

export const dynamic = "force-dynamic";

/**
 * Only the fields the species picker reads (see SpeciesCards in SpeciesCard.js
 * and the selection handling in ObservationTally). A full species document
 * serializes to ~2.2 KB — iNaturalist photo metadata, ancestry arrays, and the
 * alias/virtual duplicates emitted by toJSON — which made this endpoint ~280 KB
 * for 128 species. Trimmed it is roughly a quarter of that.
 */
function toClientSpecies(doc) {
  const s =
    typeof doc.toObject === "function"
      ? doc.toObject({ virtuals: false, aliases: false })
      : doc;
  const photo = s.default_photo;
  return {
    _id: String(s._id),
    taxonId: s.taxonId,
    id: s.taxonId,
    name: s.name,
    rank: s.rank,
    preferred_common_name: s.preferred_common_name,
    common_name: s.common_name,
    iconic_taxon_name: s.iconic_taxon_name,
    iconic_taxon_id: s.iconic_taxon_id,
    wikipedia_url: s.wikipedia_url,
    default_photo: photo
      ? {
          medium_url: photo.medium_url,
          square_url: photo.square_url,
          url: photo.url,
          attribution: photo.attribution,
          license_code: photo.license_code,
        }
      : null,
  };
}

const getCachedSpecies = unstable_cache(
  async () => {
    await dbConnect();
    const allSpeciesNames = Object.values(predefinedSpecies).flat();
    const speciesDocs = await Species.findOrFetchMany(allSpeciesNames);
    return speciesDocs.map(toClientSpecies);
  },
  // "v2": payload shape changed; don't serve the old cached shape.
  ["predefined-species", "v2"],
  { revalidate: 3600 },
);

export async function GET() {
  try {
    const speciesDocs = await getCachedSpecies();
    return NextResponse.json(speciesDocs, {
      status: 200,
      headers: {
        // Same list for every user; let the CDN serve it for an hour.
        "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error) {
    console.error("Error fetching species:", error);
    return NextResponse.json(
      { error: "Error fetching species data" },
      { status: 500 },
    );
  }
}
