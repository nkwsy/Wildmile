import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function POST(request) {
  await dbConnect();

  try {
    const { deploymentId, imageIds, currentPath } = await request.json();

    let query = {};

    if (currentPath !== undefined) {
      const pathParts = currentPath ? currentPath.split("/") : [];
      query = {
        fileLocations: {
          relativePath: {
            $elemMatch: {
              $regex: /\.(jpg|jpeg|png|gif)$/i,
            },
          },
        },
      };

      pathParts.forEach((part, index) => {
        if (part) {
          query[`relativePath.${index}`] = part;
        }
      });
    } else if (imageIds?.length) {
      query = { _id: { $in: imageIds } };
    }

    // Get total count of images that will be assigned
    const totalCount = await CameratrapMedia.countDocuments(query);

    // Check for images that already have a deploymentId
    const conflictingImages = await CameratrapMedia.find({
      ...query,
      deploymentId: { $exists: true, $ne: null, $ne: deploymentId },
    }).select("relativePath deploymentId");

    return NextResponse.json({
      totalCount,
      conflictingImages,
    });
  } catch (error) {
    console.error("Error checking images:", error);
    return NextResponse.json(
      { message: "Error checking images", error: error.message },
      { status: 500 }
    );
  }
}
