"use server";

import { revalidateTag } from "next/cache";
import dbConnect from "lib/db/setup";

import User from "models/User";
import UserProgress from "models/users/UserProgress";
import Observation from "models/cameratrap/Observation";
import PlantObservation from "models/PlantObservation"; // Corrected import path
import TrashLog from "models/Trash";
import IndividualTrashItem from "models/IndividualTrashItem";
import TrashItem from "models/TrashItem";
import Achievement from "models/users/Achievement";

// Function to get a single user's stats
export async function getUserStats(userId) {
  if (!userId) return null;

  try {
    const user = await User.findById(userId, "profile roles");
    const progress = await UserProgress.findOne({ user: userId });
    await progress.checkAchievements();
    // await progress.save();
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
    ]);

    // Find the highest level RANK achievement that has been earned
    const rankAchievements = progress.achievements
      .filter(
        (a) => a.achievement.type === "RANK" && a.progress === 100 && a.earnedAt
      )
      .sort((a, b) => b.achievement.level - a.achievement.level);

    // Get the avatar from the highest rank achievement or use poop emoji
    const avatar =
      rankAchievements.length > 0
        ? rankAchievements[0].achievement.badge
        : "💩";

    // Format achievements for response
    const achievements = progress.achievements.map((achievement) => ({
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

    return {
      user: {
        ...user.toObject(),
        avatar: avatar,
      },
      achievements: achievements,
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return null;
  }
}

// Function to update a single user's stats
async function updateUserStats(userId) {
  await dbConnect();

  try {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error(`User not found with ID: ${userId}`);
    }

    // Get user's observations sorted by date
    const observations = await Observation.find({
      creator: user._id,
    }).sort({ createdAt: 1 });

    // Get user's plant observations sorted by date
    const plantObservations = await PlantObservation.find({
      observedBy: user._id,
    }).sort({ createdAt: 1 });

    // Combine and sort action dates
    const actionDates = [
      ...observations.map(obs => obs.createdAt),
      ...plantObservations.map(plantObs => plantObs.createdAt),
    ].sort((a, b) => a - b);

    // Calculate streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let lastLoginDate = null;

    if (actionDates.length > 0) {
      // Convert action dates to local date strings (without time)
      const uniqueDates = [...new Set(actionDates.map(date => new Date(date).toLocaleDateString()))];
      uniqueDates.sort((a,b) => new Date(a) - new Date(b)); // Ensure chronological sort for dates

      if (uniqueDates.length > 0) {
        currentStreak = 1;
        longestStreak = 1; // Initialize longestStreak to 1 if there's at least one action
        let tempStreak = 1;

        for (let i = 1; i < uniqueDates.length; i++) {
          const prevDate = new Date(uniqueDates[i - 1]);
          const currDate = new Date(uniqueDates[i]);

          const dayDiff = Math.floor(
            (currDate - prevDate) / (1000 * 60 * 60 * 24)
          );

          if (dayDiff === 1) {
            tempStreak++;
          } else if (dayDiff > 1) { // Reset if dates are not consecutive
            tempStreak = 1;
          }
          // If dayDiff is 0, it means same day, streak continues, tempStreak doesn't reset or increment here.

          currentStreak = tempStreak;
          longestStreak = Math.max(longestStreak, currentStreak);
        }

        // Check if current streak is still active
        const lastDate = new Date(uniqueDates[uniqueDates.length - 1]);
        const today = new Date(new Date().toLocaleDateString()); // Use today's date without time
        const daysSinceLastAction = Math.floor(
          (today - lastDate) / (1000 * 60 * 60 * 24)
        );

        if (daysSinceLastAction > 1) {
          currentStreak = 0;
        }
         // If daysSinceLastAction is 0 or 1, currentStreak remains as calculated
      }
      lastLoginDate = new Date(actionDates[actionDates.length - 1]); // Use the latest timestamp from original actionDates
    }

    // Initialize stats object
    const stats = {
      // Camera Trap stats
      imagesReviewed: 0,
      animalsObserved: 0,
      uniqueSpecies: new Set(),
      blanksLogged: 0,
      deploymentsReviewed: new Set(),
      speciesConsensus: 0,
      expertVerified: 0,

      // Trash stats
      itemsLogged: 0,
      uniqueMaterials: new Set(),
      uniqueCategories: new Set(),
      cleanupEvents: 0,
      weightCollected: 0,
      locationsMonitored: new Set(),
      dataQualityScore: 0,
      totalVolunteers: 0,
      totalHours: 0,
      avgItemsPerCleanup: 0,
      sitesMonitored: new Set(),
    };

    // Calculate total images reviewed (unique media IDs)
    const uniqueMediaIds = new Set(observations.map((obs) => obs.mediaId));
    stats.imagesReviewed = uniqueMediaIds.size;

    // Calculate total animals observed
    const animalObservations = observations.filter(
      (obs) => obs.observationType === "animal"
    );
    stats.animalsObserved = animalObservations.reduce(
      (sum, obs) => sum + (obs.count || 1),
      0
    );

    // Calculate total blanks logged
    stats.blanksLogged = observations.filter(
      (obs) => obs.observationType === "blank"
    ).length;

    // Calculate unique species
    stats.uniqueSpecies = new Set(
      animalObservations
        .map((obs) => obs.scientificName)
        .filter((name) => name && name.trim() !== "")
    );

    // Calculate deployments reviewed
    stats.deploymentsReviewed = new Set(
      observations.map((obs) => obs.deployment).filter(Boolean)
    );

    // Calculate consensus and expert verified
    stats.speciesConsensus = observations.filter(
      (obs) => obs.consensusReached
    ).length;

    stats.expertVerified = observations.filter(
      (obs) => obs.expertVerified
    ).length;

    // Trash Log Aggregation
    const [trashLogStats] = await TrashLog.aggregate([
      { $match: { creator: user._id, deleted: false } },
      {
        $group: {
          _id: null,
          cleanupEvents: { $sum: 1 },
          weightCollected: { $sum: "$weight" },
          totalVolunteers: { $sum: "$numOfParticipants" },
          sitesMonitored: { $addToSet: "$site" },
          totalHours: {
            $sum: {
              $divide: [
                { $subtract: ["$timeEnd", "$timeStart"] },
                3600000, // Convert ms to hours
              ],
            },
          },
        },
      },
    ]);

    // Individual Trash Items Aggregation
    const trashItemsAggregation = await IndividualTrashItem.aggregate([
      {
        $match: { creator: user._id },
      },
      {
        $lookup: {
          from: "trashitems",
          localField: "itemId",
          foreignField: "_id",
          as: "itemDetails",
        },
      },
      {
        $unwind: "$itemDetails",
      },
      {
        $group: {
          _id: null,
          itemsLogged: { $sum: "$quantity" },
          uniqueMaterials: { $addToSet: "$itemDetails.material" },
          uniqueCategories: { $addToSet: "$itemDetails.catagory" },
          locationsMonitored: {
            $addToSet: {
              $cond: [
                { $ifNull: ["$location", false] },
                {
                  $concat: [
                    "$location.coordinates.0",
                    ",",
                    "$location.coordinates.1",
                  ],
                },
                null,
              ],
            },
          },
        },
      },
    ]);

    // Update stats from trash log aggregation
    if (trashLogStats) {
      stats.cleanupEvents = trashLogStats.cleanupEvents;
      stats.weightCollected = trashLogStats.weightCollected || 0;
      stats.totalVolunteers = trashLogStats.totalVolunteers || 0;
      stats.totalHours = Math.round(trashLogStats.totalHours || 0);
      stats.sitesMonitored = new Set(
        trashLogStats.sitesMonitored.filter(Boolean)
      );
    }

    // Update stats from individual trash items
    if (trashItemsAggregation.length > 0) {
      const trashItemStats = trashItemsAggregation[0];
      stats.itemsLogged = trashItemStats.itemsLogged || 0;
      stats.uniqueMaterials = new Set(
        trashItemStats.uniqueMaterials.filter(Boolean)
      );
      stats.uniqueCategories = new Set(
        trashItemStats.uniqueCategories.filter(Boolean)
      );
      stats.locationsMonitored = new Set(
        trashItemStats.locationsMonitored.filter(Boolean)
      );
    }

    // Calculate averages
    if (stats.cleanupEvents > 0) {
      stats.avgItemsPerCleanup = Math.round(
        stats.itemsLogged / stats.cleanupEvents
      );
    }

    // Convert Sets to counts
    stats.uniqueSpecies = stats.uniqueSpecies.size;
    stats.deploymentsReviewed = stats.deploymentsReviewed.size;
    stats.uniqueMaterials = stats.uniqueMaterials.size;
    stats.uniqueCategories = stats.uniqueCategories.size;
    stats.locationsMonitored = stats.locationsMonitored.size;
    stats.sitesMonitored = stats.sitesMonitored.size;

    // Update user progress
    let progress = await UserProgress.findOne({ user: user._id });
    if (!progress) {
      progress = new UserProgress({ user: user._id });
    }

    // Update streaks
    progress.streaks = {
      current: currentStreak,
      longest: Math.max(longestStreak, progress.streaks?.longest || 0),
      lastLoginDate: lastLoginDate,
    };

    // Update stats
    Object.assign(progress.stats, stats);

    // Check achievements (which now handles points calculation)

    await progress.checkAchievements();
    // Save progress
    await progress.save();

    // Return populated data
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
    ]);

    // Transform domain ranks to include populated data
    const formattedDomainRanks = {};
    progress.domainRanks.forEach((value, domain) => {
      formattedDomainRanks[domain] = {
        points: value.points || 0,
        currentRank: value.currentRank
          ? {
              id: value.currentRank._id,
              name: value.currentRank.name,
              description: value.currentRank.description,
              icon: value.currentRank.icon,
              badge: value.currentRank.badge,
              level: value.currentRank.level,
              type: value.currentRank.type,
              domain: value.currentRank.domain,
              points: value.currentRank.points,
            }
          : null,
      };
    });

    // Get highest rank achievement for avatar
    const highestRank = Object.values(formattedDomainRanks)
      .map((domain) => domain.currentRank)
      .filter(Boolean)
      .sort((a, b) => b.level - a.level)[0];

    return {
      user: {
        ...user.toObject(),
        avatar: highestRank?.badge || "💩",
      },
      stats: progress.stats,
      streaks: progress.streaks,
      achievements: progress.achievements.map((a) => ({
        id: a.achievement._id,
        name: a.achievement.name,
        description: a.achievement.description,
        icon: a.achievement.icon,
        badge: a.achievement.badge,
        level: a.achievement.level,
        type: a.achievement.type,
        domain: a.achievement.domain,
        points: a.achievement.points,
        progress: a.progress,
        earnedAt: a.earnedAt,
        criteria: a.achievement.criteria,
      })),
      totalPoints: progress.totalPoints,
      level: progress.level,
      domainRanks: formattedDomainRanks,
      lastActive:
        progress.stats.lastActive ||
        (progress.streaks.lastLoginDate
          ? new Date(progress.streaks.lastLoginDate)
          : null),
    };
  } catch (error) {
    console.error(`Error updating stats for user ${userId}:`, error);
    throw error;
  }
}

// Function to update all users' stats
async function updateAllUserStats() {
  try {
    const users = await User.find({});
    const results = [];

    for (const user of users) {
      try {
        const progress = await updateUserStats(user._id);
        results.push({ userId: user._id, success: true, progress });
      } catch (error) {
        results.push({
          userId: user._id,
          success: false,
          error: error.message,
        });
      }
    }

    console.log("Successfully processed all users");
    return results;
  } catch (error) {
    console.error("Error updating all user stats:", error);
    throw error;
  }
}

// Allow running directly from command line
// if (require.main === module) {
//   const userId = process.argv[2];
//   if (userId) {
//     updateUserStats(userId)
//       .then(() => process.exit(0))
//       .catch((error) => {
//         console.error(error);
//         process.exit(1);
//       });
//   } else {
//     updateAllUserStats()
//       .then(() => process.exit(0))
//       .catch((error) => {
//         console.error(error);
//         process.exit(1);
//       });
//   }
// }

export { updateUserStats, updateAllUserStats };

export async function updateUserProgress(userId, stats) {
  await dbConnect();

  try {
    // 1. Capture the state of achievements *before* calling updateUserStats
    let previousAchievements = [];
    const progressBeforeUpdate = await UserProgress.findOne({ user: userId })
      .select("achievements.achievement achievements.earnedAt") // Select only what's needed
      .populate({
        path: "achievements.achievement",
        select: "_id", // Only need the ID for previousAchievements map
      });

    if (progressBeforeUpdate && progressBeforeUpdate.achievements) {
      previousAchievements = progressBeforeUpdate.achievements
        .filter((a) => a.earnedAt && a.achievement) // Ensure achievement is populated
        .map((a) => a.achievement._id.toString());
    }

    // 2. Call updateUserStats. This function handles all calculations,
    //    streak updates, achievement checks, saving UserProgress, and
    //    returns a comprehensive object with the updated state,
    //    including populated achievements.
    const updatedProgressData = await updateUserStats(userId);

    if (!updatedProgressData) {
      // Handle case where updateUserStats might fail or return null (e.g., user not found)
      console.error(`updateUserStats returned no data for userId: ${userId}`);
      return { success: false, error: "Failed to update user stats." };
    }

    // 3. Redundant operations (re-fetch, checkAchievements, save) are removed
    //    as updateUserStats now handles them.

    // 4. Calculate newlyEarnedAchievements using data from updatedProgressData.
    //    The `updatedProgressData.achievements` array is already populated and formatted
    //    by updateUserStats. Each achievement object in it has an `id` and `earnedAt`.
    let newlyEarnedAchievements = [];
    if (updatedProgressData.achievements) {
      newlyEarnedAchievements = updatedProgressData.achievements
        .filter(
          (ach) => // `ach` is an achievement object from updatedProgressData.achievements
            ach.earnedAt &&
            !previousAchievements.includes(ach.id.toString()) // ach.id is already the stringified _id
        )
        .map((ach) => ({ // Map to the structure expected by the caller
          id: ach.id,
          name: ach.name,
          description: ach.description,
          icon: ach.icon,
          badge: ach.badge,
          points: ach.points,
          earnedAt: ach.earnedAt,
        }));
    }

    // Revalidate relevant cache tags
    revalidateTag("user-progress");
    revalidateTag("achievements");

    // Return the comprehensive data from updateUserStats along with newAchievements
    return {
      success: true,
      newAchievements: newlyEarnedAchievements,
      progressData: updatedProgressData
    };
  } catch (error) {
    console.error("Error updating progress:", error);
    // Ensure the error object structure is consistent if needed by callers
    return { success: false, error: error.message || "Failed to update progress" };
  }
}
