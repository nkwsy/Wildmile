import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";
import CameratrapDeployment from "models/cameratrap/Deployment";

export const dynamic = "force-dynamic";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const onlyUsed = searchParams.get("onlyUsed") === "true";

  try {
    let locations;

    if (onlyUsed) {
      // Get locations that have been used in deployments
      const usedLocationIds = await CameratrapDeployment.distinct("locationId");
      locations = await DeploymentLocation.find({
        _id: { $in: usedLocationIds },
      }).sort({ locationName: 1 });
    } else {
      // Get all locations
      locations = await DeploymentLocation.find({}).sort({ locationName: 1 });
    }

    return NextResponse.json(locations);
  } catch (error) {
    console.error("Error fetching deployment locations:", error);
    return NextResponse.json(
      { message: "Error fetching deployment locations" },
      { status: 500 }
    );
  }
}
