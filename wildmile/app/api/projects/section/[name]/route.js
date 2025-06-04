import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Section from "models/Section";

export async function GET(request, { params }) {
  await dbConnect();
  const section_name = params.name;

  if (section_name === "new") {
    return NextResponse.json({ modules: [] });
  }

  try {
    const section = await Section.findOne({ name: section_name }).lean();

    if (!section) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 });
    }

    return NextResponse.json(section);
  } catch (error) {
    console.error("Error fetching section:", error);
    return NextResponse.json(
      { error: "Failed to fetch section" },
      { status: 500 }
    );
  }
}
