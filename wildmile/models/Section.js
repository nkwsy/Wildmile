import mongoose from "mongoose";
const { pointsSchema, polygonSchema } = require("./locationSchemas");
const mongoose_delete = require("mongoose-delete");

const SectionSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    dateInstalled: Date,
    installed: { type: Boolean, default: false },
    decommisioned: { type: Boolean, default: false },
    size: {
      width: Number,
      length: Number,
    },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
  },
  { timestamps: true }
);

SectionSchema.plugin(mongoose_delete, { overrideMethods: "all" });
export default mongoose.models.Section ||
  mongoose.model("Section", SectionSchema);
