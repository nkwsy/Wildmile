import mongoose from "mongoose";
const Schema = mongoose.Schema;

const ResourceSchema = new Schema(
  {
    type: {
      type: String,
      required: true,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: false, // Making this field optional
    },
    authorized_users: [
      {
        type: Schema.Types.ObjectId,
        ref: "User", // Reference to User model
      },
    ],
    data: {
      type: Schema.Types.Mixed, // Flexible field for various data types
      required: true,
    },
    metadata: {
      tags: [String], // Array of strings for tags
      description: String,
      title: String,
    },
  },
  { timestamps: true }
); // Enable automatic handling of createdAt and updatedAt fields

export default mongoose.models.Resource ||
  mongoose.model("Resource", ResourceSchema);
