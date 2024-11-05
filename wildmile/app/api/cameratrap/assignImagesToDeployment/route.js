import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function POST(request) {
  await dbConnect();

  try {
    const { deploymentId, imageIds, currentPath } = await request.json();

    // If currentPath is provided, assign all images in that path and subfolders
    if (currentPath !== undefined) {
      const pathParts = currentPath ? currentPath.split("/") : [];

      const query = {
        fileLocations: {
          relativePath: {
            $elemMatch: {
              $regex: /\.(jpg|jpeg|png|gif)$/i,
            },
          },
        },
      };

      // Add path matching conditions
      pathParts.forEach((part, index) => {
        if (part) {
          query[`relativePath.${index}`] = part;
        }
      });

      const result = await CameratrapMedia.updateMany(query, {
        $set: { deploymentId },
      });

      return NextResponse.json({
        message: `Successfully assigned ${result.modifiedCount} images to deployment`,
      });
    }

    // Handle individual image assignments
    if (!deploymentId || !imageIds?.length) {
      return NextResponse.json(
        { message: "Missing required parameters" },
        { status: 400 }
      );
    }

    const result = await CameratrapMedia.updateMany(
      { _id: { $in: imageIds } },
      { $set: { deploymentId } }
    );

    return NextResponse.json({
      message: `Successfully assigned ${result.modifiedCount} images to deployment`,
    });
  } catch (error) {
    console.error("Error in assignImagesToDeployment:", error);
    return NextResponse.json(
      { message: "Error assigning images", error: error.message },
      { status: 500 }
    );
  }
}
