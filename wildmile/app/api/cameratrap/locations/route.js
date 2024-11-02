import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import DeploymentLocations from "models/cameratrap/DeploymentLocations";

export async function GET() {
  await dbConnect();
  try {
    const locations = await DeploymentLocations.find({ retired: { $ne: true } })
      .populate("creator")
      .lean();
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch locations" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await dbConnect();
  try {
    const data = await request.json();
    const location = await DeploymentLocations.create(data);
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create location" },
      { status: 500 }
    );
  }
}
