const mongoose = require("mongoose");
import { MacroSample } from "./MacroSample";

// Macro Image Schema
const MacroImageSchema = new mongoose.Schema({
  macroSampleId: { type: mongoose.Schema.Types.ObjectId, ref: "MacroSample" },
  filename: { type: String, required: true },
  path: { type: String, required: true },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  createdAt: { type: Date, default: Date.now },
  identification: {
    name: { type: String, required: true },
    confidence: { type: Number, required: true },
  },
});

export default mongoose.models.MacroImage ||
  mongoose.model("MacroImage", MacroImageSchema);
