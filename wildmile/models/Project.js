import mongoose from "mongoose";
const { PointSchema, PolygonSchema } = require("./locationSchemas");

import slugify from "slugify";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    description: { type: String, default: "" },
    notes: { type: String, default: "" },
    decommisioned: { type: Boolean, default: false },
    locationBoundry: { type: PolygonSchema },
    location: { type: PointSchema },
    deleted: { type: Boolean, default: false },
    private: { type: Boolean, default: false },
    authorizedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

ProjectSchema.virtual("items", {
  ref: "Section", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "projectId", // is equal to `foreignField`
  justOne: false,
  options: { sort: { createdAt: -1 } },
});
// ProjectSchema.pre("save", function (next) {
//   this.slug = slugify(this.name, { lower: true, strict: true });
//   next();
// });

export default mongoose.models.Project ||
  mongoose.model("Project", ProjectSchema);
