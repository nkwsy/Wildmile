import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";

export async function GET() {
  try {
    await dbConnect();

    // Aggregate unique values
    const [zones, projectAreas, tags] = await Promise.all([
      DeploymentLocation.distinct("zone"),
      DeploymentLocation.distinct("projectArea"),
      DeploymentLocation.distinct("tags"),
    ]);

    // Return simple arrays for Autocomplete components
    return NextResponse.json({
      zones: zones.filter(Boolean).sort(),
      projectAreas: projectAreas.filter(Boolean).sort(),
      tags: tags.flat().filter(Boolean).sort(),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch suggestions" },
      { status: 500 }
    );
  }
}
