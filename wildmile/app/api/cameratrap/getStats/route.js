import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import CameratrapMedia from "models/cameratrap/Media";
import Observation from "models/cameratrap/Observation";
import User from "models/User";

export async function GET(request) {
  await dbConnect();

  try {
    // Get the search params to check if this is a forced refresh
    const { searchParams } = new URL(request.url);
    const forceRefresh = searchParams.get("force") === "true";

    // Get total images
    const totalImages = await CameratrapMedia.countDocuments();

    // Get unique mediaIds in observations
    const uniqueMediaIdsWithObservations = await Observation.distinct("mediaId");

    // Get total images with validated observations
    const validatedObservations = await Observation.aggregate([
      {
        $group: {
          _id: {
            mediaId: "$mediaId",
            scientificName: "$scientificName",
          },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          count: { $gte: 2 },
        },
      },
      {
        $group: {
          _id: "$_id.mediaId",
        },
      },
      {
        $count: "count",
      },
    ]);

    // Get total number of volunteers
    const totalVolunteers = await Observation.distinct("creator");

    // Get new images in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newImages30Days = await CameratrapMedia.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get top 3 creators with proper user lookup
    const topCreators = await Observation.aggregate([
      {
        $group: {
          _id: "$creator",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 5,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          id: "$_id",
          name: {
            $ifNull: [
              { $arrayElemAt: ["$userInfo.profile.name", 0] },
              { $arrayElemAt: ["$userInfo.email", 0] },
              "Unknown User",
            ],
          },
          count: 1,
        },
      },
    ]);

    // Get most active in last 7 days with proper user lookup
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const [mostActive7Days] = await Observation.aggregate([
      {
        $match: {
          createdAt: { $gte: sevenDaysAgo },
        },
      },
      {
        $group: {
          _id: "$creator",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          name: {
            $ifNull: [
              { $arrayElemAt: ["$userInfo.profile.name", 0] },
              { $arrayElemAt: ["$userInfo.email", 0] },
              "Unknown User",
            ],
          },
          count: 1,
        },
      },
    ]);

    // Get user with most blank observations with proper user lookup
    const [mostBlanks] = await Observation.aggregate([
      {
        $match: {
          observationType: "blank",
        },
      },
      {
        $group: {
          _id: "$creator",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 1,
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $project: {
          name: {
            $ifNull: [
              { $arrayElemAt: ["$userInfo.profile.name", 0] },
              { $arrayElemAt: ["$userInfo.email", 0] },
              "Unknown User",
            ],
          },
          count: 1,
        },
      },
    ]);

    const response = NextResponse.json({
      totalImages,
      totalImagesWithObservations: uniqueMediaIdsWithObservations.length,
      totalValidatedImages: validatedObservations[0]?.count || 0,
      totalVolunteers: totalVolunteers.length,
      uniqueMediaIds: uniqueMediaIdsWithObservations.length, // for backwards compatibility
      newImages30Days,
      topCreators: topCreators.map((creator) => ({
        ...creator,
        name: creator.name || "Unknown User",
      })),
      mostActive7Days: mostActive7Days || { name: "No activity", count: 0 },
      mostBlanks: mostBlanks || { name: "No blanks", count: 0 },
    });

    // Set cache control headers
    response.headers.set(
      "Cache-Control",
      forceRefresh
        ? "no-store"
        : "public, s-maxage=3600, stale-while-revalidate=3600"
    );

    return response;
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { message: "Error fetching statistics" },
      { status: 500 }
    );
  }
}
