import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";
  const limit = parseInt(searchParams.get("limit")) || 40;
  const page = parseInt(searchParams.get("page")) || 1;
  const skip = (page - 1) * limit;

  try {
    const pathParts = path ? path.split("/") : [];
    const pathDepth = pathParts.length;

    // Get all unique folders at current path level
    const folderQuery = {
      deploymentId: null,
      [`relativePath.${pathDepth}`]: { $exists: true },
    };

    // Add conditions for matching the current path
    pathParts.forEach((part, index) => {
      if (part) {
        folderQuery[`relativePath.${index}`] = part;
      }
    });

    // Get unique values at the next level
    const allPaths = await CameratrapMedia.distinct(
      `relativePath.${pathDepth}`,
      folderQuery
    );

    // Filter out files (assuming files have extensions)
    const folders = allPaths.filter((p) => p && !p.includes("."));

    // Get images from current path AND all subdirectories
    const imageQuery = {
      deploymentId: null,
      // Match the current path prefix
      relativePath: {
        $elemMatch: {
          $regex: /\.(jpg|jpeg|png|gif)$/i,
        },
      },
    };

    // Add path matching conditions
    pathParts.forEach((part, index) => {
      if (part) {
        imageQuery[`relativePath.${index}`] = part;
      }
    });

    const totalImages = await CameratrapMedia.countDocuments(imageQuery);

    // Get random sample of images if limit is specified
    const images = await CameratrapMedia.aggregate([
      { $match: imageQuery },
      ...(limit
        ? [
            { $sample: { size: limit } }, // Get random sample if limit specified
          ]
        : []),
      { $sort: { timestamp: -1 } },
    ]);

    return NextResponse.json({
      folders,
      images,
      totalImages,
    });
  } catch (error) {
    console.error("Error in getMediaByPath:", error);
    return NextResponse.json(
      { message: "Error fetching media", error: error.message },
      { status: 500 }
    );
  }
}
