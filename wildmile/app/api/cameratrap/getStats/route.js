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

    // Get unique mediaIds in observations aka images with observations
    const uniqueMediaIdsWithObservations = await Observation.distinct("mediaId");

    // Get total observations
    const totalObservations = await Observation.countDocuments();

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

    // Get total number of volunteers that have added at least one observation
    const totalVolunteers = await Observation.distinct("creator");

    // Get new images in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newImages30Days = await CameratrapMedia.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    });

    // Get top 5 creators with proper user lookup
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

    // Calculate average observation time in seconds
    const [sumObservationTime] = await Observation.aggregate([
      { $sort: { creator: 1, createdAt: 1 } },
      {
        $group: {
          _id: "$creator",
          createdAtDates: { $push: "$createdAt" }
        }
      },
      {
        $addFields: {
          timeDifferences: {
            $map: {
              input: { $range: [ 1, { $size: "$createdAtDates" }] },
              as: "index",
              in: {
                $subtract: [
                  { $arrayElemAt: [ "$createdAtDates", "$$index" ] },
                  { $arrayElemAt: [ "$createdAtDates", { $subtract: ["$$index", 1] } ] }
                ]
              }
            }
          }
        }
      },
      { $unwind: { path: "$timeDifferences" } },
      {
        $match: {
          timeDifferences: { $lt: 3600000 } // Less than 1 hour (3600000 ms)
        }
      },
      {
        $group: {
          _id: null,
          "sumObservation_ms": {
            "$sum": "$timeDifferences"
          }
        }
      },
      {
        $project: {
          _id: 0,
          overallSum_hours: {
            $divide: [
              "$sumObservation_ms",
              3600000
            ]
          }
        }
      }
    ]);

    const response = NextResponse.json({
      totalImages,
      totalObservations,
      totalImagesWithObservations: uniqueMediaIdsWithObservations.length,
      totalValidatedImages: validatedObservations[0]?.count || 0,
      totalVolunteers: totalVolunteers.length,
      totalObservationTime: sumObservationTime?.overallSum_hours || 0,
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
