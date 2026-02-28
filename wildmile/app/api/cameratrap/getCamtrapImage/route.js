import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import CameratrapDeployment from "models/cameratrap/Deployment";

export const maxDuration = 30;

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const deploymentId = searchParams.get("deploymentId");
  const locationId = searchParams.get("locationId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const startTime = searchParams.get("startTime");
  const endTime = searchParams.get("endTime");
  const reviewed = searchParams.get("reviewed");
  const reviewedByUser = searchParams.get("reviewedByUser");
  const direction = searchParams.get("direction");
  const currentImageId = searchParams.get("currentImageId");
  const selectedImageId = searchParams.get("selectedImageId");
  
  const animalProbabilityParam = searchParams.get("animalProbability");
  let minAnimalConf, maxAnimalConf;

  if (animalProbabilityParam) {
    const parts = animalProbabilityParam.split(',');
    if (parts.length === 2) {
      minAnimalConf = parseFloat(parts[0]);
      maxAnimalConf = parseFloat(parts[1]);
    }
  }

  let query = {};
  let timeQuery = [];

  query.flagged = { $ne: true };

  if (selectedImageId) {
    query.mediaID = selectedImageId;
  }
  if (deploymentId) {
    query.deploymentId = deploymentId;
  }

  if (locationId) {
    // Find all deployments with this locationId
    const deployments = await CameratrapDeployment.find({
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

  if (typeof minAnimalConf === 'number' && typeof maxAnimalConf === 'number' && !isNaN(minAnimalConf) && !isNaN(maxAnimalConf)) {
    query.aiResults = {
      $elemMatch: {
        confAnimal: {
          $gte: minAnimalConf,
          $lte: maxAnimalConf,
        },
        confHuman: {
          $lte: 0.85,
        }
      },
    };
  }

  try {
    let image;

    if (direction && currentImageId) {
      const currentImage = await CameratrapMedia.findById(
        currentImageId,
        "timestamp"
      ).lean();
      if (currentImage) {
        const sort =
          direction === "next" ? { timestamp: 1 } : { timestamp: -1 };
        const timeCondition =
          direction === "next"
            ? { $gt: currentImage.timestamp }
            : { $lt: currentImage.timestamp };

        query.timestamp = timeCondition;
        image = await CameratrapMedia.findOne(query).sort(sort).lean();
      }
    } else {
      // Use the randomSeed index for O(log n) random lookup instead of
      // the O(n) $sample-after-$match aggregation.
      image = await CameratrapMedia.findOneRandom(query);
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
