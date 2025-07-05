import mongoose from "mongoose";

const FilterDefaultSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      default: "cameratrapIdentifyDefaults", // Identifier for this specific set of defaults
    },
    locationId: {
      type: String, // Or mongoose.Schema.Types.ObjectId if it references another model directly
      default: null,
    },
    startDate: {
      type: Date,
      default: null,
    },
    endDate: {
      type: Date,
      default: null,
    },
    startTime: {
      type: String, // Storing as string e.g., "HH:MM"
      default: "",
    },
    endTime: {
      type: String, // Storing as string e.g., "HH:MM"
      default: "",
    },
    reviewed: {
      type: Boolean,
      default: false,
    },
    reviewedByUser: {
      type: Boolean,
      default: false,
    },
    animalProbability: {
      type: [Number], // Should be an array of two numbers [min, max]
      default: [0.75, 1.0],
      validate: [
        (val) => val.length === 2 && val[0] <= val[1],
        "Animal probability must be an array of two numbers [min, max] where min <= max.",
      ],
    },
    // Add any other filters that might become defaultable in the future
  },
  { timestamps: true }
);

export default mongoose.models.FilterDefault ||
  mongoose.model("FilterDefault", FilterDefaultSchema);
