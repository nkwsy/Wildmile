import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";
import { revalidateTag } from "next/cache";
import Deployment from "models/cameratrap/Deployment";
import Camera from "models/cameratrap/Camera";
import User from "models/User";
import { getExistingLocations } from "app/actions/CameratrapActions";

export async function GET(request, props) {
  const params = await props.params;
  try {
    const location = await getExistingLocations({ detailed: true });
    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch location" },
      { status: 500 }
    );
  }
}

export async function PUT(request, props) {
  const params = await props.params;
  try {
    await dbConnect();
    const data = await request.json();

    const location = await DeploymentLocation.findByIdAndUpdate(
      params.id,
      {
        locationName: data.locationName,
        zone: data.zone,
        projectArea: data.projectArea,
        location: {
          type: "Point",
          coordinates: data.coordinates,
        },
        tags: data.tags,
        mount: data.mount,
        notes: data.notes,
        favorite: data.favorite,
        retired: data.retired,
      },
      { new: true }
    );

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }
    revalidateTag("locations");
    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update location" },
      { status: 500 }
    );
  }
}

export async function DELETE(request, props) {
  const params = await props.params;
  try {
    await dbConnect();
    const deployments = await Deployment.find({ location: params.id });
    if (deployments.length > 0) {
      return NextResponse.json(
        {
          error:
            "Location has deployments, location should be retired rather than deleted",
        },
        { status: 400 }
      );
    }
    const location = await DeploymentLocation.findByIdAndDelete(params.id);

    if (!location) {
      return NextResponse.json(
        { error: "Location not found" },
        { status: 404 }
      );
    }
    revalidateTag("locations");
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete location" },
      { status: 500 }
    );
  }
}
