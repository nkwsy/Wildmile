import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function POST(request) {
  await dbConnect();

  try {
    const { imageIds } = await request.json();

    if (!imageIds?.length) {
      return NextResponse.json(
        { message: "No images specified" },
        { status: 400 }
      );
    }

    const result = await CameratrapMedia.updateMany(
      { _id: { $in: imageIds } },
      { $unset: { deploymentId: "" } }
    );

    return NextResponse.json({
      message: `Successfully removed ${result.modifiedCount} images from deployment`,
    });
  } catch (error) {
    console.error("Error in removeImagesFromDeployment:", error);
    return NextResponse.json(
      { message: "Error removing images", error: error.message },
      { status: 500 }
    );
  }
}
