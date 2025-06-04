import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import mongoose from "mongoose";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const path = searchParams.get("path") || "";
  const deploymentId = searchParams.get("deploymentId") || null;
  const limit = parseInt(searchParams.get("limit")) || 40;
  const page = parseInt(searchParams.get("page")) || 1;
  const skip = (page - 1) * limit;

  try {
    // Get deployment details including camera info
    const deployment = await mongoose
      .model("CameratrapDeployment")
      .findById(deploymentId)
      .populate("cameraId");

    if (!deployment) {
      return NextResponse.json(
        { message: "Deployment not found" },
        { status: 404 }
      );
    }

    const cameraName = deployment.cameraId.name.toLowerCase();
    const pathParts = path ? path.split("/") : [];
    const pathDepth = pathParts.length;

    // Update folder query to include camera name pattern and deployment date range
    const folderQuery = {
      //   [`relativePath.${pathDepth}`]: { $exists: true },
      relativePath: {
        $elemMatch: {
          $regex: new RegExp(cameraName, "i"),
        },
      },
      timestamp: {
        $gte: deployment.deploymentStart,
        ...(deployment.deploymentEnd && { $lte: deployment.deploymentEnd }),
      },
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

    // Update image query to include deployment criteria
    const imageQuery = {
      deploymentId: deploymentId,
      relativePath: {
        $elemMatch: {
          $regex: /\.(jpg|jpeg|png|gif)$/i,
        },
      },
      timestamp: {
        $gte: deployment.deploymentStart,
        ...(deployment.deploymentEnd && { $lte: deployment.deploymentEnd }),
      },
    };

    const totalImages = await CameratrapMedia.countDocuments(imageQuery);

    // Get the earliest and latest timestamps for the images
    const timeRange = await CameratrapMedia.aggregate([
      { $match: imageQuery },
      {
        $group: {
          _id: null,
          earliestTimestamp: { $min: "$timestamp" },
          latestTimestamp: { $max: "$timestamp" },
        },
      },
    ]);

    const timestamps =
      timeRange.length > 0
        ? {
            earliest: timeRange[0].earliestTimestamp,
            latest: timeRange[0].latestTimestamp,
          }
        : null;

    console.log(timestamps);

    let images = [];
    // Get random sample of images if limit is specified
    images = await CameratrapMedia.aggregate([
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
      timestamps,
    });
  } catch (error) {
    console.error("Error in getMediaByPath:", error);
    return NextResponse.json(
      { message: "Error fetching media", error: error.message },
      { status: 500 }
    );
  }
}
