import mongoose from "mongoose";

const trashItemSchema = new mongoose.Schema(
  {
    name: { type: String },
    material: String,
    catagory: { type: String, index: true },
    description: String,
    photo: String,
    averageWeight: Number,
    floats: Boolean,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    // strictPopulate: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

trashItemSchema.virtual("individualTrashItem", {
  ref: "IndividualTrashItem", // The model to use
  localField: "_id", // Find people where `localField`
  foreignField: "itemId", // is equal to `foreignField`
  justOne: true, // Only get one document
});
trashItemSchema.index({ name: 1, type: -1 });

export default mongoose.models.TrashItem ||
  mongoose.model("TrashItem", trashItemSchema);
