import mongoose from 'mongoose'

const trashItemSchema = new Schema({
  name: String,
  material: String,
  catagory: { type: String, index: true },
  description: String,
  photo: String,
  averageWeight: Number,
  floats: Boolean,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true })

trashItemSchema.index({ name: 1, type: -1 })

export default mongoose.models.TrashItem || mongoose.model('TrashItem', trashItemSchema)
