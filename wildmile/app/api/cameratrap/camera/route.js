import { NextResponse } from "next/server";
import dbConnect from "/lib/db/setup";
import Camera from "/models/cameratrap/Camera";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

export async function POST(request) {
  try {
    await dbConnect();

    const session = await getSession({ headers });
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    if (!data.name || !data.model) {
      return NextResponse.json(
        { message: "Name and model are required fields" },
        { status: 400 }
      );
    }

    const existing = await Camera.findOne({ name: data.name });
    if (existing) {
      return NextResponse.json(
        { message: "A camera with this name already exists" },
        { status: 400 }
      );
    }

    const cameraData = {
      name: data.name,
      model: data.model,
      manufacturer: data.manufacturer,
      serial: data.serial,
      connectivity: data.connectivity,
      purchaseDate: data.purchaseDate,
      notes: data.notes,
      creator: session._id,
      features: {
        nightVision: false,
        motionDetection: false,
        waterproof: false,
        video: false,
        audio: false,
        timeLapse: false,
      },
    };

    const camera = await Camera.create(cameraData);
    revalidateTag("cameras");
    return NextResponse.json(camera);
  } catch (error) {
    console.error("Camera creation error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to create camera" },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    await dbConnect();
    const data = await request.json();

    if (!data._id) {
      return NextResponse.json(
        { message: "Camera ID is required" },
        { status: 400 }
      );
    }

    if (data.name) {
      const existing = await Camera.findOne({
        name: data.name,
        _id: { $ne: data._id },
      });
      if (existing) {
        return NextResponse.json(
          { message: "A camera with this name already exists" },
          { status: 400 }
        );
      }
    }

    const camera = await Camera.findByIdAndUpdate(
      data._id,
      {
        name: data.name,
        model: data.model,
        manufacturer: data.manufacturer,
        serial: data.serial,
        connectivity: data.connectivity,
        purchaseDate: data.purchaseDate,
        notes: data.notes,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!camera) {
      return NextResponse.json(
        { message: "Camera not found" },
        { status: 404 }
      );
    }
    revalidatePath("/cameratrap/camera");
    revalidateTag("cameras");
    return NextResponse.json(camera);
  } catch (error) {
    console.error("Camera update error:", error);
    return NextResponse.json(
      { message: error.message || "Failed to update camera" },
      { status: 500 }
    );
  }
}
