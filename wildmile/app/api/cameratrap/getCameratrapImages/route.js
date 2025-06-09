import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import Deployment from "models/cameratrap/Deployment";
import DeploymentLocation from "models/cameratrap/DeploymentLocations";
import Observation from "models/cameratrap/Observation";
import User from "models/User";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 12;
  const skip = (page - 1) * limit;
  // Filters
  const type = searchParams.get("type");
  const consensusStatus = searchParams.get("consensusStatus");
  const species = searchParams.get("species");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const deploymentId = searchParams.get("deploymentId");
  const locationId = searchParams.get("locationId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const reviewed = searchParams.get("reviewed");
  const favorites = searchParams.get("favorites");
  const reviewedByUser = searchParams.get("reviewedByUser");
  const userFavorite = searchParams.get("userFavorite"); // boolean must also have reviewedByUser present
  const accepted = searchParams.get("accepted"); // boolean
  const needsReview = searchParams.get("needsReview"); // boolean
  // Sorting methods
  const sort = searchParams.get("sort");
  const sortDirection = searchParams.get("sortDirection");
  const currentImageId = searchParams.get("currentImageId");
  const maxConfBlank = searchParams.get("maxConfBlank");

  const session = await getSession({ headers });
  let query = {};
  query['aiResults.confHuman'] = { $lte: 0.50 };
  let sortQuery = {};
  let timeQuery = [];

  // Sorting methods
  if (sort) {
    sortQuery = { [sort]: sortDirection === "asc" ? 1 : -1 };
  }
  if (deploymentId) {
    query.deploymentId = deploymentId;
  }

  // Logic for consensus
  if (type === "animals") {
    query["speciesConsensus"] = {
      $elemMatch: { observationType: "animal" },
    };
  } else if (type === "humans") {
    query["speciesConsensus"] = {
      $elemMatch: { observationType: "human" },
    };
  }

  if (consensusStatus) {
    query.consensusStatus = consensusStatus;
  }
  if (species) {
    // Split the species string into an array if it contains commas
    const speciesArray = Array.isArray(species)
      ? species
      : species.split(",").map((s) => s.trim());

    query["speciesConsensus.scientificName"] = { $in: speciesArray };
  }

  if (favorites === "true") {
    query.favoriteCount = { $gt: 0 };
  }

  if (reviewedByUser && reviewedByUser !== "false") {
    try {
      // Ensure it's a valid ObjectId
      if (session) {
        query.reviewers = session._id;
      }
    } catch (error) {
      console.warn("Invalid reviewedByUser ID:", reviewedByUser);
    }
  }

  if (userFavorite === "true") {
    try {
      if (session) {
        query.favorites = session._id;
      }
    } catch (error) {
      console.warn("Invalid session ID for favorites:", session);
    }
  }

  if (needsReview === "true") {
    query.needsReview = true;
  }

  if (locationId) {
    // Find all deployments with this locationId
    const deployments = await Deployment.find({
      locationId: locationId,
    });
    const deploymentIds = deployments.map((d) => d._id);
    query.deploymentId = { $in: deploymentIds };
  } else if (deploymentId) {
    query.deploymentId = deploymentId;
  }

  if (startDate || endDate || startTime || endTime) {
    let timestampConditions = {};

    if (startDate && !isNaN(new Date(startDate).getTime())) {
      timestampConditions.$gte = new Date(startDate);
    }
    if (endDate && !isNaN(new Date(endDate).getTime())) {
      timestampConditions.$lte = new Date(endDate);
    }

    if (Object.keys(timestampConditions).length > 0) {
      query.timestamp = timestampConditions;
    }

    if (startTime || endTime) {
      if (startTime) {
        const [startHour, startMinute] = startTime.split(":").map(Number);
        timeQuery.push({
          $or: [
            {
              $and: [
                { $eq: [{ $hour: "$timestamp" }, startHour] },
                { $gte: [{ $minute: "$timestamp" }, startMinute] },
              ],
            },
            { $gt: [{ $hour: "$timestamp" }, startHour] },
          ],
        });
      }

      if (endTime) {
        const [endHour, endMinute] = endTime.split(":").map(Number);
        timeQuery.push({
          $or: [
            {
              $and: [
                { $eq: [{ $hour: "$timestamp" }, endHour] },
                { $lte: [{ $minute: "$timestamp" }, endMinute] },
              ],
            },
            { $lt: [{ $hour: "$timestamp" }, endHour] },
          ],
        });
      }
    }
  }

  if (timeQuery.length > 0) {
    query.$expr = { $and: timeQuery };
  }

  if (reviewed === "true") {
    query.reviewCount = { $gt: 0 };
  }

  if (maxConfBlank) {
    query['aiResults.confBlank'] = { $lte: parseFloat(maxConfBlank) };
  }

  try {
    const [images, totalImages] = await Promise.all([
      CameratrapMedia.find(query)
        .populate({
          path: "deploymentId",
          model: Deployment,
          populate: {
            path: "locationId",
            model: DeploymentLocation,
          },
        })
        .populate({
          path: "observations",
          model: Observation,
          populate: {
            path: "creator",
            model: User,
            select: "name email",
          },
        })
        .populate({
          path: "reviewers",
          model: User,
          select: "name email",
        })
        .populate({
          path: "favorites",
          model: User,
          select: "name email",
        })
        .sort(sortQuery || { timestamp: -1 })
        .skip(skip)
        .limit(limit),
      CameratrapMedia.countDocuments(query),
    ]);

    return NextResponse.json(
      {
        images,
        totalImages,
        page,
        totalPages: Math.ceil(totalImages / limit),
      },
      {
        headers: {
          "Cache-Control": "no-store",
          tags: ["media"],
        },
      }
    );
  } catch (error) {
    console.error("Error fetching deployment images:", error);
    return NextResponse.json(
      { message: "Error fetching images", error: error.message },
      { status: 500 }
    );
  }
}
