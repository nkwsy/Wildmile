import mongoose from "mongoose";

const ModuleSchema = new mongoose.Schema(
  {
    dateInstalled: Date,
    installed: Boolean,
    x: Number,
    y: Number,
    sectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
    placement: {
      section: { x: Number, y: Number },
      project: { x: Number, y: Number },
    },
    model: String,
    orientation: String,
    shape: String,
    notes: String,
    flipped: Boolean,
    tags: Array,
    decommisioned: Boolean,
    sponsor: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { collection: "mods" }
);

export default mongoose.models.Module || mongoose.model("Module", ModuleSchema);
