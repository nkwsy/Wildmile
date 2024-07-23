const mongoose = require("mongoose");

const ObservationSchema = new mongoose.Schema({
  // should just be the _id field
  // observationID: {
  //   type: String,
  //   required: true,
  //   unique: true,
  // },
  deploymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deployment",
    required: true,
  },
  mediaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Media",
  },
  eventId: String, // This should be a reference to an Event model? not even sure what this is
  eventStart: {
    type: Date,
    required: true,
  },
  eventEnd: {
    type: Date,
    required: true,
  },
  observationLevel: {
    type: String,
    required: true,
    enum: ["media", "event"],
  },
  observationType: {
    type: String,
    required: true,
    enum: ["animal", "human", "vehicle", "blank", "unknown", "unclassified"],
  },
  cameraSetupType: String,
  scientificName: String, // This should be a reference to a Species model, or use a taxonomy API. Should have refrence pics for user
  count: {
    type: Number,
    min: 1,
  },
  lifeStage: String,
  sex: String,
  behavior: String,
  individualID: String,
  individualPositionRadius: {
    type: Number,
    min: 0,
  },
  individualPositionAngle: {
    type: Number,
    min: -90,
    max: 90,
  },
  individualSpeed: {
    type: Number,
    min: 0,
  },
  bboxX: {
    type: Number,
    min: 0,
    max: 1,
  },
  bboxY: {
    type: Number,
    min: 0,
    max: 1,
  },
  bboxWidth: {
    type: Number,
    min: 1e-15,
    max: 1,
  },
  bboxHeight: {
    type: Number,
    min: 1e-15,
    max: 1,
  },
  classificationMethod: String,
  classifiedBy: String,
  classificationTimestamp: Date,
  classificationProbability: {
    type: Number,
    min: 0,
    max: 1,
  },
  observationTags: String, // This could be where we flag great pictures
  observationComments: String,
});

module.exports =
  mongoose.models.Observation ||
  mongoose.model("Observation", ObservationSchema);
