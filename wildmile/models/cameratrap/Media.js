import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    mediaID: {
      type: String,
      required: true,
      unique: true,
    },
    timestamp: {
      type: Date,
      required: true,
    },
    publicURL: String,
    relativePath: [String],
    filePath: String,
    filePublic: Boolean,
    fileName: String,
    fileMediatype: String,
    exifData: mongoose.Schema.Types.Mixed,
    favorite: Boolean,
    favoriteCount: {
      type: Number,
      default: 0,
    },
    favorites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    mediaComments: [
      {
        text: String,
        author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    reviewed: {
      type: Boolean,
      default: false,
    },
    accepted: {
      type: Boolean,
      default: false,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    observations: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Observation",
      },
    ],
    lastObservation: {
      type: Date,
      default: null,
    },
    consensusStatus: {
      type: String,
      enum: ["Pending", "ConsensusReached", "MoreAnnotationsNeeded"],
      default: "Pending",
    },
    speciesConsensus: [
      {
        observationType: String,
        scientificName: String,
        taxonID: String,
        count: Number,
        accepted: {
          type: Boolean,
          default: false,
        },
        observationCount: {
          type: Number,
          default: 0,
        },
      },
    ],
    reviewers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// Add a pre-save hook to ensure timestamp is always valid
MediaSchema.pre("save", function (next) {
  if (this.timestamp && isNaN(this.timestamp.getTime())) {
    this.timestamp = new Date();
  }
  next();
});

// Add an index on relativePath for efficient querying
MediaSchema.index({ relativePath: 1 });

// Updated method to update observations and check for consensus
MediaSchema.methods.updateObservationsAndCheckConsensus = async function () {
  await this.populate("observations");
  this.lastObservation = new Date();

  const observationTypes = {};
  const uniqueReviewers = new Set();

  this.observations.forEach((obs) => {
    if (!observationTypes[obs.observationType]) {
      observationTypes[obs.observationType] = [];
    }
    observationTypes[obs.observationType].push(obs);

    // Add the creator of the observation to the set of unique reviewers
    uniqueReviewers.add(obs.creator.toString());
  });

  this.speciesConsensus = Object.entries(observationTypes).map(
    ([observationType, observations]) => {
      const counts = {};
      observations.forEach((obs) => {
        const key =
          obs.observationType === "animal"
            ? obs.scientificName
            : observationType;
        counts[key] = (counts[key] || 0) + 1;
      });

      const mostCommonKey = Object.entries(counts).reduce((a, b) =>
        b[1] > a[1] ? b : a
      )[0];
      const consensusCount = counts[mostCommonKey];

      return {
        observationType,
        scientificName: observationType === "animal" ? mostCommonKey : null,
        count:
          observationType === "animal"
            ? parseInt(observations[0].count) || 0
            : 0,
        accepted: consensusCount >= 3,
        observationCount: observations.length,
      };
    }
  );

  // Update consensusStatus based on speciesConsensus
  const allAccepted = this.speciesConsensus.every(
    (consensus) => consensus.accepted
  );
  const anyAccepted = this.speciesConsensus.some(
    (consensus) => consensus.accepted
  );

  if (allAccepted) {
    this.consensusStatus = "ConsensusReached";
  } else if (anyAccepted) {
    this.consensusStatus = "MoreAnnotationsNeeded";
  } else {
    this.consensusStatus = "Pending";
  }

  // Update reviewCount and reviewers
  this.reviewers = Array.from(uniqueReviewers);
  this.reviewCount = this.reviewers.length;

  await this.save();
};

// New method to add an observation and update consensus
MediaSchema.methods.addObservationAndUpdateConsensus = async function (
  observation
) {
  this.observations.push(observation);

  // Add the creator of the observation to the reviewers array if not already present
  if (!this.reviewers.includes(observation.creator)) {
    this.reviewers.push(observation.creator);
  }

  await this.updateObservationsAndCheckConsensus();
};

// Updated static method to add an observation and update consensus for a specific media
MediaSchema.statics.addObservationAndUpdateConsensusForMedia = async function (
  mediaId,
  observation
) {
  const media = await this.findById(mediaId);
  if (media) {
    await media.addObservationAndUpdateConsensus(observation);
  }
};

// Check if the model already exists before compiling
const CameratrapMedia =
  mongoose.models.CameratrapMedia ||
  mongoose.model("CameratrapMedia", MediaSchema);

export default CameratrapMedia;
