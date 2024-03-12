import mongoose from "mongoose";
const { pointsSchema, polygonSchema } = require("./locationSchemas");

const SectionSchema = new mongoose.Schema({
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
});

export default mongoose.models.Section ||
  mongoose.model("Section", SectionSchema);
