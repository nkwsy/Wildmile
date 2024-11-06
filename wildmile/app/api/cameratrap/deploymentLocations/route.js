import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import DeploymentLocation from "/models/cameratrap/DeploymentLocations";
import Deployment from "/models/cameratrap/Deployment";
import Camera from "/models/cameratrap/Camera";
export const dynamic = "force-dynamic";

export async function GET() {
  await dbConnect();
  try {
    // Fetch all deployment locations
    const locations = await DeploymentLocation.find().lean();

    // For each location, find associated deployments and categorize them
    const locationsWithDeployments = await Promise.all(
      locations.map(async (location) => {
        const deployments = await Deployment.find({
          locationId: location._id,
        })
          .populate({
            path: "cameraId",
            model: Camera,
            select: "name model serialNumber", // Add any other camera fields you need
          })
          .lean();

        const activeDeployments = deployments.filter(
          (deployment) => !deployment.deploymentEnd
        );
        const inactiveDeployments = deployments.filter(
          (deployment) => deployment.deploymentEnd
        );

        return {
          ...location,
          deployments: {
            active: activeDeployments,
            inactive: inactiveDeployments,
          },
        };
      })
    );

    return NextResponse.json(locationsWithDeployments);
  } catch (error) {
    console.error("Error fetching deployment locations:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
