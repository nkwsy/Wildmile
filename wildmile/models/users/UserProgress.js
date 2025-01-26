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
  const achievements = await Achievement.find({ isActive: true });

  // Get unique domains from achievements
  const domains = [...new Set(achievements.map((a) => a.domain))];

  // Initialize domain points
  const domainPoints = {};
  domains.forEach((domain) => {
    domainPoints[domain] = 0;
    // Initialize domain in domainRanks if it doesn't exist
    if (!this.domainRanks.has(domain)) {
      this.domainRanks.set(domain, { points: 0 });
    }
  });

  const newAchievements = [];

  for (const achievement of achievements) {
    try {
      // Calculate progress for each criterion
      const criteriaProgress = achievement.criteria.map((criterion) => {
        // Get the stat value, defaulting to 0 if undefined
        let statValue = 0;
        if (criterion.type === "TOTAL_POINTS") {
          statValue = domainPoints[achievement.domain] || 0;
        } else {
          statValue = this.stats[criterion.type.toLowerCase()] || 0;
        }

        const threshold = criterion.threshold || 0;

        // Skip invalid thresholds to prevent NaN
        if (threshold === 0) {
          return 0;
        }

        // Calculate progress based on operator
        switch (criterion.operator) {
          case "lte":
            return Math.max(
              0,
              Math.min(100, ((threshold - statValue) / threshold) * 100)
            );
          case "eq":
            return statValue === threshold ? 100 : 0;
          case "gte":
          default:
            return Math.max(0, Math.min(100, (statValue / threshold) * 100));
        }
      });

      // Calculate overall progress, ensuring it's a valid number
      const overallProgress =
        criteriaProgress.length > 0
          ? Math.floor(
              criteriaProgress.reduce((sum, progress) => sum + progress, 0) /
                criteriaProgress.length
            )
          : 0;

      // Ensure progress is a valid number between 0 and 100
      const validProgress = Math.max(0, Math.min(100, overallProgress || 0));

      // Check if all criteria are met
      const eligible = achievement.criteria.every((criterion) => {
        const statValue =
          criterion.type === "TOTAL_POINTS"
            ? domainPoints[achievement.domain] || 0
            : this.stats[criterion.type.toLowerCase()] || 0;

        switch (criterion.operator) {
          case "gte":
            return statValue >= criterion.threshold;
          case "lte":
            return statValue <= criterion.threshold;
          case "eq":
            return statValue === criterion.threshold;
          default:
            return false;
        }
      });

      // Find existing progress or create new
      const existingIndex = this.achievements.findIndex(
        (a) => a.achievement.toString() === achievement._id.toString()
      );

      if (existingIndex >= 0) {
        // Update existing achievement
        this.achievements[existingIndex].progress = validProgress;
        if (eligible && this.achievements[existingIndex].progress !== 100) {
          this.achievements[existingIndex].earnedAt = new Date();
          if (achievement.type !== "RANK") {
            this.totalPoints += achievement.points;
            domainPoints[achievement.domain] =
              (domainPoints[achievement.domain] || 0) + achievement.points;
          }
          newAchievements.push(achievement);
        }
      } else {
        // Add new achievement
        this.achievements.push({
          achievement: achievement._id,
          progress: validProgress,
          earnedAt: eligible ? new Date() : null,
        });

        if (eligible) {
          if (achievement.type !== "RANK") {
            this.totalPoints += achievement.points;
            domainPoints[achievement.domain] =
              (domainPoints[achievement.domain] || 0) + achievement.points;
          }
          newAchievements.push(achievement);
        }
      }

      // Update domain-specific rank if this is a rank achievement
      if (achievement.type === "RANK" && eligible) {
        const domainRank = this.domainRanks.get(achievement.domain) || {};
        domainRank.currentRank = achievement._id;
        this.domainRanks.set(achievement.domain, domainRank);
      }
    } catch (error) {
      console.error(`Error processing achievement ${achievement.name}:`, error);
      continue; // Skip this achievement if there's an error
    }
  }

  // Update domain points
  for (const [domain, points] of Object.entries(domainPoints)) {
    const domainRank = this.domainRanks.get(domain) || {};
    domainRank.points = points;
    this.domainRanks.set(domain, domainRank);
  }

  return newAchievements;
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

export default mongoose.models.UserProgress ||
  mongoose.model("UserProgress", UserProgressSchema);
