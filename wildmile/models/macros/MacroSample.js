import mongoose from "mongoose";
// const AutoIncrement = require("mongoose-sequence")(mongoose);
// import MacroImageSchema from "./MacroImages"; // Assuming MacroImageSchema is correctly imported from "./MacroImages"
// Assuming PointSchema is correctly imported from "./locationSchemas"
import { PointSchema } from "models/locationSchemas";

// Macroinvertebrate data schema
const MacroinvertebrateDataSchema = new mongoose.Schema({
  type: { type: String, required: true },
  count: { type: Number, required: true },
});

// Macro sample box schema
const MacroSampleSchema = new mongoose.Schema(
  {
    boxNum: Number,
    samplingPeriod: { type: Number },
    dateDeployed: { type: Date },
    dateCollected: { type: Date },
    deploymentDuration: { type: Number },
    location: { type: mongoose.Schema.Types.ObjectId, ref: "MacroLocation" },
    treatment: [],
    replicateNumber: { type: Number },
    depth: { type: Number },
    substrate: { type: String },
    // canopy: { type: Boolean },
    numberOfCSO: { type: Number },
    volunteerName: { type: String },
    imageFolder: { type: String },
    macroinvertebrateData: [MacroinvertebrateDataSchema],
    notes: { type: String },
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
  }
);

MacroSampleSchema.pre("save", function (next) {
  this.deploymentDuration =
    Math.abs(this.dateCollected - this.dateDeployed) / (1000 * 60 * 60 * 24); // Calculate duration in days
  next();
});
// TODO implement after boxes are added to the DB
// MacroSampleSchema.plugin(AutoIncrement, {
//   id: "box_num_seq",
//   inc_field: "boxNum",
// });

// Model creation
export default mongoose.models.MacroSample ||
  mongoose.model("MacroSample", MacroSampleSchema);
// Apply the plugin to the MacroSampleSchema

// module.exports = {
//   MacroinvertebrateDataSchema,
// };
