import mongoose from "mongoose";
// const AutoIncrement = require("mongoose-sequence")(mongoose);
// import MacroImageSchema from "./MacroImages"; // Assuming MacroImageSchema is correctly imported from "./MacroImages"
// Assuming PointSchema is correctly imported from "./locationSchemas"
import { PointSchema } from "models/locationSchemas";

// Macro sample box schema
const MacroLocationSchema = new mongoose.Schema({
  locationName: { type: String },
  location: PointSchema,
  treatment: [],
  substrate: { type: String },
  canopy: { type: Boolean },
  dateStart: { type: Date },
  dateEnd: { type: Date },
  images: [],
  tags: [],
  notes: { type: String },
  creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

// Model creation
export default mongoose.models.MacroLocation ||
  mongoose.model("MacroLocation", MacroLocationSchema);
// Apply the plugin to the MacroSampleSchema
