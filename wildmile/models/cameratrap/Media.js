import mongoose from "mongoose";

const MediaSchema = new mongoose.Schema({
  // should just be the ObjectId. could create an alias to field for cameratrap-DP compliance?
  //   mediaID: {
  //     type: String,
  //     required: true,
  //     unique: true
  //   },
  deploymentID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deployment",
    required: true,
  },
  captureMethod: {
    type: String,
    enum: ["activityDetection", "timeLapse"],
    default: "activityDetection",
  },
  timestamp: {
    type: Date,
    required: true,
  },
  // could be used to store the path to the file on the server in Wildlife_Camera folder without S3 path
  relitivePath: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(?=^[^./~])(^((?!\.{2}).)*$).*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid file path!`,
    },
  },
  filePath: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(?=^[^./~])(^((?!\.{2}).)*$).*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid file path!`,
    },
  },
  filePublic: {
    type: Boolean,
    required: true,
  },
  fileName: String,
  fileMediatype: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^(image|video|audio)\/.*$/.test(v);
      },
      message: (props) => `${props.value} is not a valid media type!`,
    },
  },
  exifData: mongoose.Schema.Types.Mixed,
  favorite: Boolean,
  mediaComments: String,
});

const Media = mongoose.model("Media", MediaSchema);

module.exports = Media;
