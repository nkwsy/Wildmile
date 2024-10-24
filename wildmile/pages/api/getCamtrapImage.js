import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  await dbConnect();

  try {
    const {
      deploymentId,
      startDate,
      endDate,
      reviewed,
      direction,
      currentImageId,
      userId,
    } = req.query;

    let query = {};
    let sort = {};

    // Filter by deploymentId
    if (deploymentId) {
      query.deploymentId = deploymentId;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    // Filter by review status
    if (reviewed === "true") {
      query.reviewed = true;
    } else if (reviewed === "false") {
      query.reviewed = false;
    }

    // Filter by user's review status
    if (userId) {
      if (reviewed === "true") {
        query.reviewers = { $in: [userId] };
      } else if (reviewed === "false") {
        query.reviewers = { $nin: [userId] };
      }
    }

    // Handle next/previous image
    if (direction && currentImageId) {
      const currentImage = await CameratrapMedia.findOne({
        mediaID: currentImageId,
      });
      if (!currentImage) {
        return res.status(404).json({ message: "Current image not found" });
      }

      if (direction === "next") {
        query.timestamp = { $gt: currentImage.timestamp };
        sort = { timestamp: 1 };
      } else if (direction === "previous") {
        query.timestamp = { $lt: currentImage.timestamp };
        sort = { timestamp: -1 };
      }
    } else {
      // Default to random selection if no direction is specified
      sort = { $sample: { size: 1 } };
    }

    let image;
    if (Object.keys(sort).length > 0) {
      [image] = await CameratrapMedia.find(query).sort(sort).limit(1);
    } else {
      [image] = await CameratrapMedia.aggregate([
        { $match: query },
        { $sample: { size: 1 } },
      ]);
    }

    if (image) {
      res.status(200).json(image);
    } else {
      res
        .status(404)
        .json({ message: "No images found matching the criteria" });
    }
  } catch (error) {
    console.error("Error fetching camera trap image:", error);
    res.status(500).json({ message: "Error fetching camera trap image" });
  }
}
