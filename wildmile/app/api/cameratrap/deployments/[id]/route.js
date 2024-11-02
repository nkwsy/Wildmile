import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Deployment from "models/cameratrap/Deployment";

export async function GET(request, { params }) {
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

export async function PUT(request, { params }) {
  await dbConnect();
  try {
    const body = await request.json();

    // Create update object with only valid fields
    const updateData = {};

    // Handle non-date fields
    Object.keys(body).forEach((key) => {
      if (key !== "deploymentStart" && key !== "deploymentEnd") {
        updateData[key] = body[key];
      }
    });

    // Validate and handle dates
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

    if (body.deploymentEnd) {
      const endDate = new Date(body.deploymentEnd);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid end date" },
          { status: 400 }
        );
      }
      updateData.deploymentEnd = endDate;
    }

    // Validate date order if both dates are present
    if (updateData.deploymentStart && updateData.deploymentEnd) {
      if (updateData.deploymentEnd < updateData.deploymentStart) {
        return NextResponse.json(
          { error: "Deployment end date cannot be before start date" },
          { status: 400 }
        );
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

    return NextResponse.json(updatedDeployment);
  } catch (error) {
    console.error("Error updating deployment:", error);
    return NextResponse.json(
      { error: "Failed to update deployment" },
      { status: 500 }
    );
  }
}
