const mongoose = require("mongoose");

const DeploymentSchema = new mongoose.Schema({
  // should be the _id field
  //   deploymentID: {
  //     type: String,
  //     required: true,
  //     unique: true,
  //   },
  cameraID: {
    type: String,
    required: true,
    ref: "Camera",
  },

  locationID: String,
  locationName: String,
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
  },
  coordinateUncertainty: {
    type: Number,
    min: 1,
  },
  deploymentStart: {
    type: Date,
    required: true,
  },
  deploymentEnd: {
    type: Date,
  },
  setupBy: String,
  //   cameraModel: String,
  cameraDelay: {
    type: Number,
    min: 0,
  },
  cameraHeight: {
    type: Number,
    min: 0,
  },
  cameraDepth: {
    type: Number,
    min: 0,
  },
  cameraTilt: {
    type: Number,
    min: -90,
    max: 90,
  },
  cameraHeading: {
    type: Number,
    min: 0,
    max: 360,
  },
  detectionDistance: {
    type: Number,
    min: 0,
  },
  timestampIssues: Boolean,
  baitUse: Boolean,
  featureType: String,
  habitat: String,
  deploymentGroups: String,
  deploymentTags: String,
  deploymentComments: String,
});

module.exports =
  mongoose.models.Deployment || mongoose.model("Deployment", DeploymentSchema);
