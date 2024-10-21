import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get("deploymentId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const reviewed = searchParams.get("reviewed");
  const reviewedByUser = searchParams.get("reviewedByUser");
  const direction = searchParams.get("direction");
  const currentImageId = searchParams.get("currentImageId");

  let query = {};
  let sort = null;

  if (deploymentId) {
    query.deploymentId = deploymentId;
  }

  if (startDate || endDate) {
    query.timestamp = {};
    if (startDate && !isNaN(new Date(startDate).getTime())) {
      query.timestamp.$gte = new Date(startDate);
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      query.timestamp.$lte = new Date(endDate);
    }
  }

  if (reviewed === "true") {
    query.reviewed = true;
  } else if (reviewed === "false") {
    query.reviewed = false;
  }

  // Filter by user's review status
  if (reviewedByUser === "true") {
    query.reviewedByUser = true;
  } else if (reviewedByUser === "false") {
    query.reviewedByUser = false;
  }

  // Handle next/previous image
  if (direction && currentImageId) {
    const currentImage = await CameratrapMedia.findById(currentImageId);
    if (currentImage) {
      if (direction === "next") {
        query.timestamp = { $gt: currentImage.timestamp };
        sort = { timestamp: 1 };
      } else if (direction === "previous") {
        query.timestamp = { $lt: currentImage.timestamp };
        sort = { timestamp: -1 };
      }
    }
  }

  try {
    let image;
    let totalImages = await CameratrapMedia.countDocuments(query);

    if (sort) {
      [image] = await CameratrapMedia.find(query).sort(sort).limit(1);
    } else {
      // Use aggregation for random sampling when no specific sort is required
      [image] = await CameratrapMedia.aggregate([
        { $match: query },
        { $sample: { size: 1 } },
      ]);
    }

    if (image) {
      return NextResponse.json(image);
    } else {
      return NextResponse.json(
        { message: "No images found matching the criteria" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("Error in getCamtrapImage route:", error);
    return NextResponse.json(
      { message: "Error fetching camera trap image", error: error.message },
      { status: 500 }
    );
  }
}
