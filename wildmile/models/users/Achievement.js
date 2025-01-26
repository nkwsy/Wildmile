import mongoose from "mongoose";

// Define criteria for different achievement types
const CriteriaSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    // Remove enum to allow for different domains
  },
  threshold: {
    type: Number,
    required: true,
  },
  operator: {
    type: String,
    enum: ["gte", "lte", "eq"],
    default: "gte",
  },
});

const AchievementSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: String,
    icon: String,
    badge: String,
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    type: {
      type: String,
      required: true,
      enum: ["MILESTONE", "BADGE", "RANK", "SPECIAL"],
    },
    domain: {
      type: String,
      required: true,
      enum: ["CAMERATRAP", "TRASH", "WATER_QUALITY"],
      default: "CAMERATRAP",
    },
    criteria: [CriteriaSchema],
    points: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Achievement ||
  mongoose.model("Achievement", AchievementSchema);
