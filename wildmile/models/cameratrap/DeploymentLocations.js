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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

DeploymentLocationSchema.virtual("deployments", {
  ref: "CameratrapDeployment",
  localField: "_id",
  foreignField: "locationId",
});

// Add a virtual property to check if the location is active
DeploymentLocationSchema.virtual("isActive").get(function () {
  // Check if deployments is populated and has items
  if (
    !this.deployments ||
    !Array.isArray(this.deployments) ||
    this.deployments.length === 0
  ) {
    return false;
  }

  // Location is active if any deployment doesn't have an end date
  return this.deployments.some((deployment) => !deployment.deploymentEnd);
});

module.exports =
  mongoose.models.DeploymentLocation ||
  mongoose.model("DeploymentLocation", DeploymentLocationSchema);
