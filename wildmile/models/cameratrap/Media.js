import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema(
  {
    mediaID: {
      // md5 hash of the image generated by aws
      type: String,
      required: true,
      unique: true,
    },
    imageHash: String, // hash of the image without exif data
    deploymentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deployment",
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
    fileLocations: [
      {
        publicURL: String,
        relativePath: [String],
        filePath: String,
        filePublic: Boolean,
        fileName: String,
        createdAt: { type: Date, default: Date.now },
        updatedAt: { type: Date, default: Date.now },
      },
    ],
    exifData: mongoose.Schema.Types.Mixed,
    aiResults: [{
      modelName: String,
      runDate: String, // Consider Date type if needed
      confBlank: Number,
      confHuman: Number,
      confAnimal: Number
    }],
    favorite: {
      type: Boolean,
      default: false,
    },
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
    needsReview: {
      type: Boolean,
      default: false,
    },
    flagged: {
      type: Boolean,
      default: false,
    },
    removed: {
      type: Boolean,
      default: false,
    },
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

  this.speciesConsensus = Object.entries(observationTypes).flatMap(
    ([observationType, observations]) => {
      const speciesCounts = {};
      observations.forEach((obs) => {
        if (obs.observationType === "animal") {
          const key = `${obs.scientificName}-${obs.count}`;
          speciesCounts[key] = (speciesCounts[key] || 0) + 1;
        } else {
          const key = `${observationType}-${obs.count || 1}`;
          speciesCounts[key] = (speciesCounts[key] || 0) + 1;
        }
      });

      return Object.entries(speciesCounts).map(([key, count]) => {
        const [identifier, observedCount] = key.split("-");
        if (observationType === "animal") {
          return {
            observationType,
            taxonID: identifier,
            scientificName: identifier,
            count: parseInt(observedCount) || 0,
            accepted: count >= 3,
            observationCount: count,
          };
        } else {
          return {
            observationType,
            taxonID: null,
            scientificName: null,
            count: parseInt(observedCount) || 1,
            accepted: count >= 3,
            observationCount: count,
          };
        }
      });
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
  const media = await this.findOne({ mediaID: mediaId });
  if (media) {
    await media.addObservationAndUpdateConsensus(observation);
  }
};

// Check if the model already exists before compiling
const CameratrapMedia =
  mongoose.models.CameratrapMedia ||
  mongoose.model("CameratrapMedia", MediaSchema);

export default CameratrapMedia;
