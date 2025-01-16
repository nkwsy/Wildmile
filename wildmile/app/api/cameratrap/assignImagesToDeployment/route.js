import { NextResponse } from "next/server";
import { revalidateTag, revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
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
          $elemMatch: {
            relativePath: {
              $all: pathParts.filter(Boolean),
            },
          },
        },
      };

      // Add file extension check
      if (pathParts.length > 0) {
        query["fileLocations.relativePath"] = {
          $elemMatch: { $regex: /\.(jpg|jpeg|png|gif)$/i },
        };
      }

      const result = await CameratrapMedia.updateMany(query, {
        $set: { deploymentId },
      });

      // Revalidate the media cache
      revalidateTag("media");
      revalidatePath("/cameratrap/deployment");
      redirect(`/cameratrap/deployment/${deploymentId}`);
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
