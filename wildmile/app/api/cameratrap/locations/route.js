import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";

export async function GET() {
  try {
    await dbConnect();
    const locations = await DeploymentLocation.find().sort({ locationName: 1 });
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await dbConnect();
    const data = await request.json();

    const location = await DeploymentLocation.create({
      locationName: data.locationName,
      zone: data.zone,
      location: {
        type: "Point",
        coordinates: data.coordinates,
      },
      tags: data.tags,
      mount: data.mount,
      notes: data.notes,
      favorite: data.favorite || false,
      retired: data.retired || false,
    });

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}