import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import CameratrapDeployment from "models/cameratrap/Deployment";
import Species from "models/Species";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

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
  const notReviewedByUser = searchParams.get("notReviewedByUser");
  const direction = searchParams.get("direction");
  const currentImageId = searchParams.get("currentImageId");
  const selectedImageId = searchParams.get("selectedImageId");
  const reviewMode = searchParams.get("reviewMode");

  const animalProbabilityParam = searchParams.get("animalProbability");
  let minAnimalConf, maxAnimalConf;

  if (animalProbabilityParam) {
    const parts = animalProbabilityParam.split(",");
    if (parts.length === 2) {
      minAnimalConf = parseFloat(parts[0]);
      maxAnimalConf = parseFloat(parts[1]);
    }
  }


  let query = {};
  let timeQuery = [];

  query.flagged = { $ne: true };

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

  if (reviewed === "true" || reviewMode === "true") {
    query.reviewCount = { $gt: 0 };
  }

  if (reviewMode === "true") {
    query.consensusStatus = { $ne: "ConsensusReached" };
  }

  if (
    typeof minAnimalConf === "number" &&
    typeof maxAnimalConf === "number" &&
    !isNaN(minAnimalConf) &&
    !isNaN(maxAnimalConf)
  ) {
    query.aiResults = {
      $elemMatch: {
        confAnimal: {
          $gte: minAnimalConf,
          $lte: maxAnimalConf,
        },
        confHuman: {
          $lte: 0.85,
        },
      },
    };
  }

  if (notReviewedByUser === "true" || reviewMode === "true") {
    const session = await getSession({ headers });
    if (session?._id) {
      query.reviewers = { $nin: [session._id] };
    }
  } else if (reviewedByUser === "true") {
    const session = await getSession({ headers });
    if (session?._id) {
      query.reviewers = session._id;
    }
  }

  try {
    let image;
    if (selectedImageId) {
      image = await CameratrapMedia.findOne({
        mediaID: selectedImageId,
      }).lean();
    } else if (direction === "oldest") {
      image = await CameratrapMedia.findOne(query)
        .sort({ timestamp: 1 })
        .lean();
    } else if (direction && currentImageId) {
      const currentImage = await CameratrapMedia.findById(
        currentImageId,
        "timestamp",
      ).lean();
      if (currentImage) {
        const sort =
          direction === "next" ? { timestamp: 1 } : { timestamp: -1 };
        const timeCondition =
          direction === "next"
            ? { $gt: currentImage.timestamp }
            : { $lt: currentImage.timestamp };

        query.timestamp = { ...query.timestamp, ...timeCondition };
        image = await CameratrapMedia.findOne(query).sort(sort).lean();
      }
    } else {
      image = await CameratrapMedia.findOneRandom(query);
      if (image && typeof image.toObject === "function") {
        image = image.toObject();
      }
    }

    if (image) {
      // Ensure image is a plain object
      const plainImage = typeof image.toObject === "function" ? image.toObject() : image;

      // Enhance speciesConsensus with preferred_common_name
      if (plainImage.speciesConsensus && Array.isArray(plainImage.speciesConsensus)) {
        const enrichedConsensus = await Promise.all(
          plainImage.speciesConsensus.map(async (item) => {
            try {
              // Ensure item is a plain object
              const plainItem = typeof item.toObject === "function" ? item.toObject() : item;

              if (plainItem && plainItem.observationType === "animal") {
                let species = null;
                // Try searching by numeric taxonId if taxonID is a number or can be cast to one
                const numericTaxonId = Number(plainItem.taxonID);
                if (plainItem.taxonID && !isNaN(numericTaxonId)) {
                  species = await Species.findOne({
                    taxonId: numericTaxonId,
                  }).lean();
                }
                // Fallback to searching by scientificName (which is often what taxonID holds in current data)
                if (!species && plainItem.scientificName) {
                  species = await Species.findOne({
                    name: new RegExp(`^${plainItem.scientificName}$`, "i"),
                  }).lean();
                }
                // Also try searching by taxonID as a string if it's not a number
                if (!species && plainItem.taxonID && isNaN(numericTaxonId)) {
                   species = await Species.findOne({
                    name: new RegExp(`^${plainItem.taxonID}$`, "i"),
                  }).lean();
                }

                if (species) {
                  return {
                    ...plainItem,
                    name: species.name,
                    preferred_common_name: species.preferred_common_name || plainItem.preferred_common_name,
                    taxonID: species.taxonId || plainItem.taxonID,
                    scientificName: species.name || plainItem.scientificName,
                    default_photo: species.default_photo,
                    rank: species.rank,
                    iconic_taxon_name: species.iconic_taxon_name,
                    wikipedia_url: species.wikipedia_url,
                  };
                }
              }
              return plainItem;
            } catch (err) {
              console.error("Error enriching consensus item:", err, item);
              return item;
            }
          })
        );
        plainImage.speciesConsensus = enrichedConsensus;
      }

      return NextResponse.json(plainImage);
    } else {
      return NextResponse.json(
        { message: "No images found matching the criteria" },
        { status: 404 },
      );
    }
  } catch (error) {
    console.error("Error in getCamtrapImage route:", error);
    return NextResponse.json(
      { message: "Error fetching camera trap image", error: error.message },
      { status: 500 },
    );
  }
}
