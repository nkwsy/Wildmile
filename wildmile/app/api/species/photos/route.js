import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const INAT_BASE = "https://api.inaturalist.org/v1/observations";

const VARIANT_QUERIES = {
  male: "term_id=9&term_value_id=11",
  female: "term_id=9&term_value_id=10",
  juvenile: "term_id=1&term_value_id=8",
};

async function fetchVariantPhotos(taxonId, variant) {
  const annotationFilter = VARIANT_QUERIES[variant];
  const url =
    `${INAT_BASE}?taxon_id=${taxonId}&${annotationFilter}` +
    `&photos=true&per_page=4&order_by=votes&quality_grade=research`;

  const res = await fetch(url, {
    next: { revalidate: 86400 },
  });

  if (!res.ok) return [];

  const data = await res.json();
  return (data.results || [])
    .flatMap((obs) => obs.photos || [])
    .slice(0, 4)
    .map((p) => ({
      url: p.url?.replace("square", "medium"),
      attribution: p.attribution,
    }));
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const taxonId = searchParams.get("taxon_id");

  if (!taxonId) {
    return NextResponse.json(
      { error: "taxon_id parameter is required" },
      { status: 400 }
    );
  }

  const isBird = searchParams.get("is_bird") === "true";

  try {
    const variants = isBird
      ? ["male", "female", "juvenile"]
      : ["male", "female"];

    const results = await Promise.all(
      variants.map(async (variant) => ({
        variant,
        photos: await fetchVariantPhotos(taxonId, variant),
      }))
    );

    const photos = {};
    for (const { variant, photos: variantPhotos } of results) {
      if (variantPhotos.length > 0) {
        photos[variant] = variantPhotos;
      }
    }

    return NextResponse.json(photos, {
      headers: {
        "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
      },
    });
  } catch (error) {
    console.error("Error fetching species variant photos:", error);
    return NextResponse.json(
      { error: "Error fetching variant photos" },
      { status: 500 }
    );
  }
}
