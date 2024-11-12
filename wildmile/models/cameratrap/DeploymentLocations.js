const mongoose = require("mongoose");

const { PointSchema } = require("models/locationSchemas");

const DeploymentLocationSchema = new mongoose.Schema(
  {
    locationName: {
      type: String,
      required: true,
    },
    zone: String,
    projectArea: String,
    location: PointSchema,
    tags: [String],
    mount: String,
    favorite: Boolean,
    notes: String,
    image: String,
    retired: Boolean,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

module.exports =
  mongoose.models.DeploymentLocation ||
  mongoose.model("DeploymentLocation", DeploymentLocationSchema);
