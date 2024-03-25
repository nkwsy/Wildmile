import mongoose from "mongoose";
const mongoose_delete = require("mongoose-delete");

const ModuleSchema = new mongoose.Schema(
  {
    dateInstalled: Date,
    installed: Boolean,
    x: { type: Number, required: true },
    y: { type: Number, required: true },
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    placement: {
      section: { x: Number, y: Number },
      project: { x: Number, y: Number },
    },
    model: { type: String, required: true },
    orientation: { type: String, required: true },
    shape: { type: String, required: true },
    notes: String,
    flipped: Boolean,
    tags: Array,
    deleted: Boolean,
    decommisioned: Boolean,
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { collection: "mods", timestamps: true }
);

export default mongoose.models.Module || mongoose.model("Module", ModuleSchema);
ModuleSchema.plugin(mongoose_delete, { overrideMethods: "all" });
