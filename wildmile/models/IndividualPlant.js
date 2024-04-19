import mongoose from "mongoose";
const Schema = mongoose.Schema;
const mongoose_delete = require("mongoose-delete");

const individualPlantSchema = Schema(
  {
    plant: { type: Schema.Types.ObjectId, ref: "Plant" },
    x: Number,
    y: Number,
    module: { type: Schema.Types.ObjectId, ref: "Module" },
    supplier: String,
    datePlanted: Date,
    sponsor: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

individualPlantSchema.plugin(mongoose_delete, { overrideMethods: "all" });
export default mongoose.models.IndividualPlant ||
  mongoose.model("IndividualPlant", individualPlantSchema);
