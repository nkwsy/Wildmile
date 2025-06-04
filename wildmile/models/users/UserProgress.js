import mongoose from "mongoose";
import Achievement from "models/users/Achievement";

// Create a dynamic domain ranks schema
const DomainRankSchema = new mongoose.Schema({
  currentRank: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Achievement",
  },
  points: { type: Number, default: 0 },
});

const UserProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    level: {
      type: Number,
      default: 1,
    },
    totalPoints: {
      type: Number,
      default: 0,
    },
    domainRanks: {
      type: Map,
      of: DomainRankSchema,
      default: new Map(),
    },
    stats: {
      // Camera Trap stats
      imagesReviewed: { type: Number, default: 0 },
      animalsObserved: { type: Number, default: 0 },
      uniqueSpecies: { type: Number, default: 0 },
      consecutiveDays: { type: Number, default: 0 },
      blanksLogged: { type: Number, default: 0 },
      deploymentsReviewed: { type: Number, default: 0 },
      speciesConsensus: { type: Number, default: 0 },
      expertVerified: { type: Number, default: 0 },
      // Trash stats
      itemsLogged: { type: Number, default: 0 },
      uniqueMaterials: { type: Number, default: 0 },
      cleanupEvents: { type: Number, default: 0 },
      weightCollected: { type: Number, default: 0 },
      locationsMonitored: { type: Number, default: 0 },
      dataQualityScore: { type: Number, default: 0 },
      // Water Quality stats
      samplesCollected: { type: Number, default: 0 },
      parametersMeasured: { type: Number, default: 0 },
      sitesMonitored: { type: Number, default: 0 },
      qualityChecksPassed: { type: Number, default: 0 },
      consecutiveSampling: { type: Number, default: 0 },
      lastActive: Date,
    },
    achievements: [
      {
        achievement: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Achievement",
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        progress: { type: Number, default: 0 },
      },
    ],
    streaks: {
      current: { type: Number, default: 0 },
      longest: { type: Number, default: 0 },
      lastLoginDate: Date,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Method to check and award achievements
UserProgressSchema.methods.checkAchievements = async function () {
  const Achievement = mongoose.model("Achievement");

  // First validate existing achievements
  await this.validateAchievements();

  // Get all active achievements
  const achievements = await Achievement.find({ isActive: true });
  console.log(`Found ${achievements.length} active achievements`);

  // Remove any unearned achievements to prevent duplicates
  this.achievements = this.achievements.filter((a) => a.earnedAt);

  console.log("Current stats:", this.stats);

  // Store previously earned achievements for comparison
  const previouslyEarned = new Set(
    this.achievements
      .filter((a) => a.progress === 100 && a.earnedAt)
      .map((a) => a.achievement.toString())
  );

  // Get unique domains from achievements and initialize if needed
  const domains = [...new Set(achievements.map((a) => a.domain))];
  console.log("Available domains:", domains);

  // Initialize domain points and ranks
  const domainPoints = {};
  domains.forEach((domain) => {
    domainPoints[domain] = 0;
    // Initialize domain ranks if they don't exist
    if (!this.domainRanks.has(domain)) {
      console.log(`Initializing new domain: ${domain}`);
      this.domainRanks.set(domain, {
        points: 0,
        currentRank: null,
      });
    }
  });

  // Reset total points for recalculation
  this.totalPoints = 0;
  const newAchievements = [];

  // First pass: Process non-RANK achievements
  console.log("\nProcessing non-RANK achievements first...");
  for (const achievement of achievements.filter((a) => a.type !== "RANK")) {
    try {
      console.log(
        `\nChecking achievement: ${achievement.name} (${achievement.type})`
      );

      const { validProgress, eligible } = this.calculateProgress(
        achievement,
        domainPoints
      );

      // Find or create achievement progress
      const existingIndex = this.achievements.findIndex(
        (a) => a.achievement.toString() === achievement._id.toString()
      );

      if (existingIndex >= 0) {
        // Update existing achievement
        const existing = this.achievements[existingIndex];
        const wasCompleted = existing.progress === 100 && existing.earnedAt;

        // Update progress
        existing.progress = validProgress;

        // Check if newly completed (not previously earned)
        if (
          eligible &&
          !wasCompleted &&
          !previouslyEarned.has(achievement._id.toString())
        ) {
          console.log(`Achievement newly completed: ${achievement.name}`);
          existing.earnedAt = new Date();
          this.totalPoints += achievement.points;
          domainPoints[achievement.domain] =
            (domainPoints[achievement.domain] || 0) + achievement.points;
          newAchievements.push(achievement);
        } else if (wasCompleted) {
          // Add points for previously completed achievements
          this.totalPoints += achievement.points;
          domainPoints[achievement.domain] =
            (domainPoints[achievement.domain] || 0) + achievement.points;
        }
      } else {
        // Add new achievement
        console.log(`Adding new achievement: ${achievement.name}`);
        this.achievements.push({
          achievement: achievement._id,
          progress: validProgress,
          earnedAt: eligible ? new Date() : null,
        });

        if (eligible) {
          this.totalPoints += achievement.points;
          domainPoints[achievement.domain] =
            (domainPoints[achievement.domain] || 0) + achievement.points;
          newAchievements.push(achievement);
        }
      }
    } catch (error) {
      console.error(`Error processing achievement ${achievement.name}:`, error);
    }
  }

  // Second pass: Process RANK achievements
  console.log("\nProcessing RANK achievements...");
  for (const achievement of achievements.filter((a) => a.type === "RANK")) {
    try {
      console.log(`\nChecking rank achievement: ${achievement.name}`);

      const { validProgress, eligible } = this.calculateProgress(
        achievement,
        domainPoints
      );

      // Find or create achievement progress
      const existingIndex = this.achievements.findIndex(
        (a) => a.achievement.toString() === achievement._id.toString()
      );

      if (existingIndex >= 0) {
        // Update existing rank achievement
        const existing = this.achievements[existingIndex];
        const wasCompleted = existing.progress === 100 && existing.earnedAt;

        existing.progress = validProgress;

        // Check if newly completed (not previously earned)
        if (
          eligible &&
          !wasCompleted &&
          !previouslyEarned.has(achievement._id.toString())
        ) {
          console.log(`Rank achievement newly completed: ${achievement.name}`);
          existing.earnedAt = new Date();

          // Award points for reaching new rank
          this.totalPoints += achievement.points;
          domainPoints[achievement.domain] =
            (domainPoints[achievement.domain] || 0) + achievement.points;
          newAchievements.push(achievement);
        } else if (wasCompleted) {
          // Add points for previously earned rank
          this.totalPoints += achievement.points;
          domainPoints[achievement.domain] =
            (domainPoints[achievement.domain] || 0) + achievement.points;
        }
      } else {
        // Add new rank achievement
        console.log(`Adding new rank achievement: ${achievement.name}`);
        this.achievements.push({
          achievement: achievement._id,
          progress: validProgress,
          earnedAt: eligible ? new Date() : null,
        });

        if (eligible) {
          // Award points for new rank
          this.totalPoints += achievement.points;
          domainPoints[achievement.domain] =
            (domainPoints[achievement.domain] || 0) + achievement.points;

          // Update domain rank
          const domainRank = this.domainRanks.get(achievement.domain) || {};
          domainRank.currentRank = achievement._id;
          this.domainRanks.set(achievement.domain, domainRank);

          newAchievements.push(achievement);
        }
      }
    } catch (error) {
      console.error(
        `Error processing rank achievement ${achievement.name}:`,
        error
      );
    }
  }

  // Update final domain points
  for (const [domain, points] of Object.entries(domainPoints)) {
    const domainRank = this.domainRanks.get(domain) || {};
    domainRank.points = points;
    this.domainRanks.set(domain, domainRank);
    console.log(`Final points for ${domain}: ${points}`);
  }

  // Calculate level based on total points
  // Level calculation using exponential growth:
  // - basePoints (100) is points needed for level 1
  // - Each level requires 25% more points than previous (growthFactor = 1.25)
  // - Formula: level = log(points/basePoints)/log(growthFactor) + 1
  // Example progression: L1=100, L2=125, L3=156, L4=195, L5=244, etc.
  const basePoints = 100;
  const growthFactor = 2.15;
  const getPointsForLevel = (level) =>
    basePoints * Math.pow(growthFactor, level - 1);
  this.level = Math.max(
    1,
    Math.floor(
      Math.log(this.totalPoints / basePoints) / Math.log(growthFactor)
    ) + 1
  );
  console.log(`Final total points: ${this.totalPoints}, Level: ${this.level}`);

  return newAchievements; // Now only contains truly new achievements
};

// Helper method to calculate progress for an achievement
UserProgressSchema.methods.calculateProgress = function (
  achievement,
  domainPoints
) {
  const criteriaProgress = achievement.criteria.map((criterion) => {
    let statValue = 0;
    if (criterion.type === "TOTAL_POINTS") {
      statValue = domainPoints[achievement.domain] || 0;
    } else {
      const statKey = criterion.type;
      statValue = this.stats[statKey] || 0;
    }

    const threshold = criterion.threshold || 0;
    if (threshold === 0) {
      console.log(`Skipping criterion ${criterion.type} due to zero threshold`);
      return 100;
    }

    let progress;
    switch (criterion.operator) {
      case "lte":
        progress = Math.max(
          0,
          Math.min(100, ((threshold - statValue) / threshold) * 100)
        );
        break;
      case "eq":
        progress =
          statValue >= threshold
            ? 100
            : Math.max(0, Math.min(100, (statValue / threshold) * 100));
        break;
      case "gte":
      default:
        progress = Math.max(0, Math.min(100, (statValue / threshold) * 100));
    }

    console.log(
      `${criterion.type}: value=${statValue}, threshold=${threshold}, progress=${progress}%`
    );
    return progress;
  });

  const overallProgress =
    criteriaProgress.length > 0
      ? Math.floor(
          criteriaProgress.reduce((sum, progress) => sum + progress, 0) /
            criteriaProgress.length
        )
      : 0;

  const validProgress = Math.max(0, Math.min(100, overallProgress || 0));
  const eligible = validProgress === 100;

  console.log(
    `Overall progress for ${achievement.name}: ${validProgress}%, Eligible: ${eligible}`
  );

  return { validProgress, eligible };
};

// Helper method to get current rank for a specific domain
UserProgressSchema.methods.getDomainRank = function (domain) {
  return this.domainRanks.get(domain)?.currentRank;
};

// Helper method to get points for a specific domain
UserProgressSchema.methods.getDomainPoints = function (domain) {
  return this.domainRanks.get(domain)?.points || 0;
};

// Helper method to get all available domains
UserProgressSchema.methods.getDomains = async function () {
  const Achievement = mongoose.model("Achievement");
  const domains = await Achievement.distinct("domain");
  return domains;
};

// Method to check if user has completed an achievement
UserProgressSchema.methods.hasAchievement = function (achievementId) {
  return this.achievements.some(
    (a) =>
      a.achievement.toString() === achievementId.toString() &&
      a.progress === 100
  );
};

// Method to update streak
UserProgressSchema.methods.updateStreak = function () {
  const today = new Date();
  const lastLogin = this.streaks.lastLoginDate;

  if (!lastLogin) {
    this.streaks.current = 1;
  } else {
    const daysSinceLastLogin = Math.floor(
      (today - lastLogin) / (1000 * 60 * 60 * 24)
    );

    if (daysSinceLastLogin === 1) {
      this.streaks.current += 1;
      this.streaks.longest = Math.max(
        this.streaks.current,
        this.streaks.longest
      );
    } else if (daysSinceLastLogin > 1) {
      this.streaks.current = 1;
    }
  }

  this.streaks.lastLoginDate = today;
};

// Add this before creating the model
UserProgressSchema.methods.validateAchievements = async function () {
  const Achievement = mongoose.model("Achievement");

  // Get all valid achievement IDs
  const validAchievements = await Achievement.find({ isActive: true }, "_id");
  const validIds = new Set(validAchievements.map((a) => a._id.toString()));

  // Create a map to track unique achievements
  const uniqueAchievements = new Map();

  // Filter achievements to keep only valid ones and remove duplicates
  this.achievements = this.achievements.filter((achievement) => {
    const achievementId = achievement.achievement?.toString();

    // Skip if achievement ID is invalid or not found in valid achievements
    if (!achievementId || !validIds.has(achievementId)) {
      console.log(`Removing invalid achievement: ${achievementId}`);
      return false;
    }

    // If we've seen this achievement before
    if (uniqueAchievements.has(achievementId)) {
      const existing = uniqueAchievements.get(achievementId);

      // If current achievement is completed and existing isn't, or current was completed earlier
      if (
        (achievement.earnedAt && !existing.earnedAt) ||
        (achievement.earnedAt &&
          existing.earnedAt &&
          achievement.earnedAt < existing.earnedAt)
      ) {
        uniqueAchievements.set(achievementId, achievement);
        console.log(
          `Replacing duplicate achievement with earlier completion: ${achievementId}`
        );
      } else {
        console.log(`Skipping duplicate achievement: ${achievementId}`);
      }
      return false;
    }

    // First time seeing this achievement
    uniqueAchievements.set(achievementId, achievement);
    return true;
  });

  // Sort achievements by earnedAt date
  this.achievements.sort((a, b) => {
    if (!a.earnedAt && !b.earnedAt) return 0;
    if (!a.earnedAt) return 1;
    if (!b.earnedAt) return -1;
    return a.earnedAt - b.earnedAt;
  });

  return this;
};

// Add this to the pre-save middleware
UserProgressSchema.pre("save", async function (next) {
  try {
    await this.validateAchievements();
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.models.UserProgress ||
  mongoose.model("UserProgress", UserProgressSchema);
