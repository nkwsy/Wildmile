import { NextResponse } from "next/server";
import { getPlantByID, updatePlantByID } from "lib/db/plants";
import { getSession } from "lib/getSession";

// GET handler
export async function GET(request, props) {
  const params = await props.params;
  const session = await getSession();

  // Auth check
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const start = Date.now();
    const plant = await getPlantByID(params.id);
    const end = Date.now();
    console.log(`Request took ${end - start}ms`);

    return NextResponse.json({ plant });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch plant" },
      { status: 500 }
    );
  }
}

// PUT handler
export async function PUT(request, props) {
  const params = await props.params;
  const session = await getSession();

  // Auth check
  if (!session) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  try {
    const start = Date.now();
    const body = await request.json();

    const { scientific_name, common_name, notes, image_url, synonyms } = body;

    const plant = await updatePlantByID(request, params.id, {
      scientific_name,
      common_name,
      notes,
      image_url,
      synonyms,
    });

    const end = Date.now();
    console.log(`Request took ${end - start}ms`);

    return NextResponse.json({ plant });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to update plant" },
      { status: 500 }
    );
  }
}
