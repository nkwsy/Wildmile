import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Deployment from "models/cameratrap/Deployment";
import Camera from "models/cameratrap/Camera";
import { revalidatePath } from "next/cache";
import { revalidateTag } from "next/cache";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";
export const dynamic = "force-dynamic";

export async function GET(request, props) {
  const params = await props.params;
  // Return empty response for new deployments
  if (params.id === "new") {
    return NextResponse.json({
      deploymentStart: new Date(),
      deploymentEnd: null,
      cameraHeight: 0,
      cameraTilt: 0,
    });
  }

  await dbConnect();
  try {
    const deployment = await Deployment.findById(params.id).lean();

    if (!deployment) {
      return NextResponse.json(
        { error: "Deployment not found" },
        { status: 404 }
      );
    }

    const populatedDeployment = await Deployment.populate(deployment, [
      {
        path: "locationId",
        model: "DeploymentLocation",
        options: { lean: true },
      },
      { path: "cameraId", model: "Camera", options: { lean: true } },
    ]);

    return NextResponse.json(populatedDeployment);
  } catch (error) {
    console.error("Error fetching deployment:", error);
    return NextResponse.json(
      { error: "Failed to fetch deployment" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  await dbConnect();
  const session = await getSession({ headers });
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await request.json();

    // Create deployment object with required fields
    const deploymentData = {
      cameraId: body.cameraId,
      locationId: body.locationId,
      deploymentStart: new Date(body.deploymentStart),
      cameraHeight: body.cameraHeight || 0,
      cameraTilt: body.cameraTilt || 0,
      creator: session._id,
    };

    // Only add deploymentEnd if it exists and is valid
    if (body.deploymentEnd) {
      const endDate = new Date(body.deploymentEnd);
      if (!isNaN(endDate.getTime())) {
        deploymentData.deploymentEnd = endDate;

        // Validate date order if end date is provided
        if (deploymentData.deploymentEnd < deploymentData.deploymentStart) {
          return NextResponse.json(
            { error: "Deployment end date cannot be before start date" },
            { status: 400 }
          );
        }
      }
    }

    // Add locationName if locationId is not provided
    if (!body.locationId && body.locationName) {
      deploymentData.locationName = body.locationName;
    }

    const newDeployment = await Deployment.create(deploymentData);

    // Populate the response with related data
    const populatedDeployment = await Deployment.findById(
      newDeployment._id
    ).populate([
      {
        path: "locationId",
        model: "DeploymentLocation",
      },
      { path: "cameraId", model: "Camera" },
    ]);

    revalidateTag("deployments");
    return NextResponse.json(populatedDeployment);
  } catch (error) {
    console.error("Error creating deployment:", error);
    return NextResponse.json(
      { error: "Failed to create deployment" },
      { status: 500 }
    );
  }
}

export async function PUT(request, props) {
  const params = await props.params;
  await dbConnect();
  try {
    const body = await request.json();
    const updateData = {};

    // Handle non-date fields
    Object.keys(body).forEach((key) => {
      if (key !== "deploymentStart" && key !== "deploymentEnd") {
        updateData[key] = body[key];
      }
    });

    // Validate and handle start date
    if (body.deploymentStart) {
      const startDate = new Date(body.deploymentStart);
      if (isNaN(startDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid start date" },
          { status: 400 }
        );
      }
      updateData.deploymentStart = startDate;
    }

    // Handle end date (can be null)
    if (body.hasOwnProperty("deploymentEnd")) {
      if (body.deploymentEnd === null) {
        updateData.deploymentEnd = null;
      } else {
        const endDate = new Date(body.deploymentEnd);
        if (isNaN(endDate.getTime())) {
          return NextResponse.json(
            { error: "Invalid end date" },
            { status: 400 }
          );
        }
        updateData.deploymentEnd = endDate;

        // Only validate date order if end date is provided
        if (
          updateData.deploymentStart &&
          updateData.deploymentEnd < updateData.deploymentStart
        ) {
          return NextResponse.json(
            { error: "Deployment end date cannot be before start date" },
            { status: 400 }
          );
        }
      }
    }

    const updatedDeployment = await Deployment.findByIdAndUpdate(
      params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      {
        path: "locationId",
        model: "DeploymentLocation",
      },
      { path: "cameraId", model: "Camera" },
    ]);

    if (!updatedDeployment) {
      return NextResponse.json(
        { error: "Deployment not found" },
        { status: 404 }
      );
    }

    revalidatePath("/cameratrap/deployments");
    revalidateTag("deployments");
    return NextResponse.json(updatedDeployment);
  } catch (error) {
    console.error("Error updating deployment:", error);
    return NextResponse.json(
      { error: "Failed to update deployment" },
      { status: 500 }
    );
  }
}
