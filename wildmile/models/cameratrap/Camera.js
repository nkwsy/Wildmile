const mongoose = require("mongoose");

const cameraSchema = new mongoose.Schema(
  {
    // should just be the _id field
    // Should have a user readable ID to label camera. mfg-model-0001
    //     cameraID: {
    //     type: String,
    //     required: true,
    //     unique: true,
    //   },
    _id: {
      // This should be the cameraID, Would be great if it was generated from mfg-model-sequential number
      type: String,
      required: true,
    },
    model: {
      // could store this info somewhere else and just reference it if using a lot of the same model
      // maybe in Resources?
      type: String,
      required: true,
    },
    manufacturer: {
      type: String,
    },
    resolution: {
      type: String, // E.g., "1920x1080"
    },
    connectivity: {
      type: String, // E.g., "WiFi", "Wired Ethernet"
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
    picture: {
      type: String, // should be a URL to the picture
    },
    purchaseDate: {
      type: Date,
    },
    location: {
      // don't no if this is needed.
      type: String, // E.g., "Front door", "Backyard"
    },
    // Extra fields
    notes: {
      type: String,
    },
  },
  { _id: false }
);

const Camera = mongoose.model("Camera", cameraSchema);

module.exports = Camera;
