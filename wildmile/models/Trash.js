import mongoose from "mongoose";

const { Schema } = mongoose;

const polygonSchema = new Schema({
  type: {
    type: String,
    enum: ["Polygon"],
    required: true,
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of arrays of numbers
    required: true,
  },
});

const TrashLogSchema = new Schema(
  {
    // Supporting Info
    project: { type: Schema.Types.ObjectId, ref: "Project" },
    site: String,
    timeStart: { type: Date, default: Date.now },
    timeEnd: { type: Date, default: Date.now },
    creator: { type: Schema.Types.ObjectId, ref: "User" },
    numOfParticipants: Number,
    participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
    unattributed: Boolean,
    area: polygonSchema,
    notes: String,
    weight: Number,
    deleted: { type: Boolean, default: false },
    trashiness: { type: Number, required: true },
    temp: { type: Number, required: true },
    wind: { type: Number, required: true },
    cloud: { type: Number, required: true },
    trashFound: { type: Array },

    //weather: String, TODO find API to calculate
  },
  { timestamps: true, strictPopulate: false }
);

// Does this work? using find doesnt return these values...
TrashLogSchema.virtual("items", {
  ref: "IndividualTrashItem", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "logId", // is equal to `foreignField`
  justOne: false,
  options: { sort: { itemId: -1 } },
});

export default mongoose.models.TrashLog ||
  mongoose.model("TrashLog", TrashLogSchema);
