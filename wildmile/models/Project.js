import mongoose from "mongoose";
const { pointsSchema, polygonSchema } = require("./locationSchemas");

import slugify from "slugify";

const ProjectSchema = new mongoose.Schema(
  {
    name: { type: String, unique: true, required: true },
    description: String,
    notes: String,
    decommisioned: Boolean,
    deleted: { type: Boolean, default: false },
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
