import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
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
  mediaComments: String,
});

// Add a pre-save hook to ensure timestamp is always valid
MediaSchema.pre('save', function(next) {
  if (this.timestamp && isNaN(this.timestamp.getTime())) {
    this.timestamp = new Date();
  }
  next();
});

// Add an index on relativePath for efficient querying
MediaSchema.index({ relativePath: 1 });

// Check if the model already exists before compiling
const CameratrapMedia = mongoose.models.CameratrapMedia || mongoose.model("CameratrapMedia", MediaSchema);

export default CameratrapMedia;
