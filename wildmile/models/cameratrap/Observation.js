const mongoose = require("mongoose");

const ObservationSchema = new mongoose.Schema(
  {
    // should just be the _id field
    // observationID: {
    //   type: String,
    //   required: true,
    //   unique: true,
    // },
    deploymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
      // required: true,
    },
    mediaId: {
      type: String,
      ref: "Media",
    },
    mediaInfo: {
      md5: String,
      imageHash: String,
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
      default: "media",
    },
    observationType: {
      type: String,
      required: true,
      enum: ["animal", "human", "vehicle", "blank", "unknown", "unclassified"],
      default: "animal",
    },
    cameraSetupType: String,
    taxonId: String,
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
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// Function to trigger Media update
async function triggerMediaUpdate(observation) {
  if (observation.mediaId) {
    const Media = mongoose.model("CameratrapMedia");
    await Media.updateObservationsForMedia(observation.mediaId);
  }
}

// Post-save middleware
ObservationSchema.post("save", async function (doc) {
  await triggerMediaUpdate(doc);
});

// Post-remove middleware
ObservationSchema.post("remove", async function (doc) {
  await triggerMediaUpdate(doc);
});

// Pre-update middleware
ObservationSchema.pre("findOneAndUpdate", async function () {
  const docToUpdate = await this.model.findOne(this.getQuery());
  this.oldMediaId = docToUpdate.mediaId;
});

// Post-update middleware
ObservationSchema.post("findOneAndUpdate", async function (doc) {
  if (
    this.oldMediaId &&
    this.oldMediaId.toString() !== doc.mediaId.toString()
  ) {
    const Media = mongoose.model("CameratrapMedia");
    await Media.updateObservationsForMedia(this.oldMediaId);
  }
  await triggerMediaUpdate(doc);
});

module.exports =
  mongoose.models.Observation ||
  mongoose.model("Observation", ObservationSchema);
