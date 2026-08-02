import { NextResponse } from "next/server";
import dbConnect from "lib/db/setup";
import Observation from "models/cameratrap/Observation";
import User from "models/User";
import UserProgress from "models/users/UserProgress";
import Species from "models/Species";
import CameratrapMedia from "models/cameratrap/Media";
import mongoose from "mongoose";
// import { updateUserStats } from "lib/db/updateUserStats";

// Update single user
export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const userId = searchParams.get("userId");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    // Update user stats
    // await updateUserStats(userId);
    // console.log(progress);

    // Get user info
    // const user = await User.findById(userId, "profile roles");
    let progress = await UserProgress.findOne({ user: userId });
    if (!progress) {
      progress = new UserProgress({ user: userId });
    }
    await progress.checkAchievements();
    await progress.save();

    // Get achievements with populated details
    await progress.populate([
      {
        path: "achievements.achievement",
        model: "Achievement",
        select: "name description icon badge level type domain criteria points",
      },
      {
        path: "domainRanks.$*.currentRank",
        model: "Achievement",
        select: "name description icon badge level type domain criteria points",
      },
      { path: "user", select: "profile avatar roles" },
    ]);

    // Find the highest level RANK achievement that has been earned
    const rankAchievements = (progress.achievements || [])
      .filter(
        (a) =>
          a.achievement?.type === "RANK" && a.progress === 100 && a.earnedAt,
      )
      .sort((a, b) => (b.achievement?.level || 0) - (a.achievement?.level || 0));

    // Get the avatar from the highest rank achievement or use poop emoji
    const avatar =
      rankAchievements.length > 0
        ? rankAchievements[0].achievement.badge
        : "💩";

    // Format achievements for response
    const formattedAchievements = (progress.achievements || [])
      .filter((a) => a.achievement)
      .map((achievement) => ({
        id: achievement.achievement._id,
        name: achievement.achievement.name,
        description: achievement.achievement.description,
        icon: achievement.achievement.icon,
        badge: achievement.achievement.badge,
        level: achievement.achievement.level,
        type: achievement.achievement.type,
        domain: achievement.achievement.domain,
        points: achievement.achievement.points,
        progress: achievement.progress,
        earnedAt: achievement.earnedAt,
        criteria: achievement.achievement.criteria,
      }));

    // Get all observations by the user
    const observations = await Observation.find({ creator: userId });

    // Calculate total images reviewed (unique media IDs)
    const uniqueMediaIds = new Set(observations.map((obs) => obs.mediaId));
    const totalImagesReviewed = uniqueMediaIds.size;

    // Calculate total animals observed
    const animalObservations = observations.filter(
      (obs) => obs.observationType === "animal",
    );
    const totalAnimalsObserved = animalObservations.reduce(
      (sum, obs) => sum + (obs.count || 1),
      0,
    );

    // Calculate total blanks logged
    const totalBlanksLogged = observations.filter(
      (obs) => obs.observationType === "blank",
    ).length;

    // Get top species and fetch their preferred common names
    const speciesCounts = animalObservations.reduce((acc, obs) => {
      const key = obs.scientificName;
      if (!key) return acc;
      if (!acc[key]) {
        acc[key] = {
          scientificName: key,
          count: 0,
        };
      }
      acc[key].count += obs.count || 1;
      return acc;
    }, {});

    const topSpeciesList = Object.values(speciesCounts)
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Get all unique scientific names for enrichment
    const topSpeciesNames = topSpeciesList.map((s) => s.scientificName);

    // Calculate user volunteer hours
    const userVolunteerHoursResult = await Observation.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: 1 } },
      {
        $group: {
          _id: "$creator",
          createdAtDates: { $push: "$createdAt" },
        },
      },
      {
        $addFields: {
          timeDifferences: {
            $map: {
              input: { $range: [1, { $size: "$createdAtDates" }] },
              as: "index",
              in: {
                $subtract: [
                  { $arrayElemAt: ["$createdAtDates", "$$index"] },
                  {
                    $arrayElemAt: [
                      "$createdAtDates",
                      { $subtract: ["$$index", 1] },
                    ],
                  },
                ],
              },
            },
          },
        },
      },
      { $unwind: { path: "$timeDifferences" } },
      {
        $match: {
          timeDifferences: { $lt: 3600000 }, // Less than 1 hour (3600000 ms)
        },
      },
      {
        $group: {
          _id: null,
          totalHours: {
            $sum: {
              $divide: ["$timeDifferences", 3600000], // Convert ms to hours
            },
          },
        },
      },
    ]);

    const volunteerHours = userVolunteerHoursResult[0]?.totalHours || 0;

    // Get recent labeling history (6 unique images)
    const recentHistory = await Observation.aggregate([
      { $match: { creator: new mongoose.Types.ObjectId(userId) } },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$mediaId",
          latestObservation: { $first: "$$ROOT" },
          species: {
            $addToSet: {
              scientificName: "$scientificName",
              observationType: "$observationType",
            },
          },
        },
      },
      { $sort: { "latestObservation.createdAt": -1 } },
      { $limit: 6 },
      {
        $lookup: {
          from: "cameratrapmedias",
          localField: "_id",
          foreignField: "mediaID",
          as: "media",
        },
      },
      {
        $addFields: {
          media: { $arrayElemAt: ["$media", 0] }
        }
      },
      {
        $project: {
          mediaId: "$_id",
          publicURL: "$media.publicURL",
          timestamp: "$latestObservation.createdAt",
          species: 1,
        },
      },
    ]);

    // Collect all species names for bulk lookup
    const historySpeciesNames = recentHistory.flatMap((item) =>
      item.species
        .filter((s) => s.observationType === "animal" && s.scientificName)
        .map((s) => s.scientificName)
    );

    const allScientificNames = [
      ...new Set([...topSpeciesNames, ...historySpeciesNames]),
    ];

    // Bulk lookup species for enrichment
    const speciesDocs = await Species.find({
      name: { $in: allScientificNames },
    })
      .select("name preferred_common_name")
      .lean();

    const speciesMap = new Map(
      speciesDocs.map((d) => [d.name, d.preferred_common_name])
    );

    // Enrich top species
    const enrichedTopSpecies = topSpeciesList.map((s) => ({
      ...s,
      commonName: speciesMap.get(s.scientificName) || s.scientificName,
    }));

    // Enrich recent history
    const enrichedRecentHistory = recentHistory.map((item) => ({
      ...item,
      species: item.species.map((s) => ({
        ...s,
        commonName:
          s.observationType === "animal"
            ? speciesMap.get(s.scientificName) || s.scientificName
            : s.scientificName,
      })),
    }));

    // Convert domainRanks Map to object for JSON response
    const domainRanks = {};
    if (progress.domainRanks) {
      progress.domainRanks.forEach((value, key) => {
        domainRanks[key] = value;
      });
    }


    const userDoc = progress.user && typeof progress.user.toObject === 'function'
      ? progress.user.toObject()
      : { _id: userId, profile: {}, roles: [] };

    const responseData = {
      user: {
        ...userDoc,
        avatar,
      },
      stats: {
        ...progress.stats,
        totalImagesReviewed,
        totalAnimalsObserved,
        totalBlanksLogged,
        uniqueSpeciesCount: enrichedTopSpecies.length,
      },
      streaks: progress.streaks,
      achievements: formattedAchievements,
      totalPoints: progress.totalPoints,
      level: progress.level,
      domainRanks,
      topSpecies: enrichedTopSpecies,
      uniqueSpeciesCount: [
        ...new Set(
          animalObservations.map((o) => o.scientificName).filter(Boolean),
        ),
      ].length,
      totalImagesReviewed,
      totalAnimalsObserved,
      totalBlanksLogged,
      volunteerHours,
      recentHistory: enrichedRecentHistory,
    };

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch user statistics" },
      { status: 500 },
    );
  }
}
