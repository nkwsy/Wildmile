const mongoose = require("mongoose");
// import { AutoIncrementID } from "@typegoose/auto-increment";
import { object } from "yup";
const cameraSchema = new mongoose.Schema(
  {
    // should just be the _id field
    // Should have a user readable ID to label camera. mfg-model-0001
    //     cameraID: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //   },

    name: { type: String, required: true },
    serial: {
      type: String,
      // required: true,
    },

    purchaseDate: {
      type: Date,
    },
    connectivity: {
      type: String, // E.g., "WiFi", "Wired Ethernet"
    },
    // Extra fields
    notes: {
      type: String,
    },
    comments: [{ type: String }],
    model: {
      // could store this info somewhere else and just reference it if using a lot of the same model
      // maybe in Resources?
      type: String,
      required: true,
      lowercase: true,
    },
    manufacturer: {
      type: String,
      lowercase: true,
    },
    resolution: {
      type: String, // E.g., "1920x1080"
    },
    features: {
      nightVision: {
        type: Boolean,
        default: false,
      },
      motionDetection: {
        type: Boolean,
        default: false,
      },
      waterproof: {
        type: Boolean,
        default: false,
      },
      storageType: {
        type: String, // E.g., "Cloud", "SD card"
      },
      storageCapacity: {
        type: String, // E.g., "32GB", "64GB"
      },
      video: {
        type: Boolean,
        default: false,
      },
      audio: {
        type: Boolean,
        default: false,
      },
      timeLapse: {
        type: Boolean,
        default: false,
      },
    },

    installationDate: {
      type: Date,
      default: Date.now,
    },
    instructionManual: {
      type: String,
    },
    location: {
      // don't no if this is needed.
      type: String, // E.g., "Front door", "Backyard"
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

// cameraSchema.plugin(AutoIncrementID, {});

export default mongoose.models.Camera || mongoose.model("Camera", cameraSchema);
