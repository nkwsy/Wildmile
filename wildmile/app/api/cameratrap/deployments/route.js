import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Deployment from "models/cameratrap/Deployment";
import Camera from "models/cameratrap/Camera";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await dbConnect();

    // Fetch all deployments and populate related data
    const deployments = await Deployment.find()
      .populate({
        path: "cameraId",
        model: Camera,
        select: "name model serialNumber", // Add any other camera fields you need
      })
      .populate({
        path: "locationId",
        model: DeploymentLocation,
        select: "locationName projectArea zone", // Add any other location fields you need
      })
      .lean();

    // Sort deployments by start date (most recent first)
    const sortedDeployments = deployments.sort(
      (a, b) => new Date(b.deploymentStart) - new Date(a.deploymentStart)
    );

    return NextResponse.json(sortedDeployments);
  } catch (error) {
    console.error("Error fetching deployments:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployments" },
      { status: 500 }
    );
  }
}
