import mongoose from 'mongoose'

const { Schema } = mongoose

const pointSchema = new Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
})

const TrashItemMetadataSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'TrashItem' },
  logId: { type: Schema.Types.ObjectId, ref: 'TrashLog' },
  quantity: Number,
  notes: String,
  location: pointSchema,
  photo: String,
  weight: Number,
  waterlogged: Boolean,
  aggrigateWeight: Number,
  tags: Array,
}, { timestamps: true })

export default mongoose.models.TrashItemMetadata || mongoose.model('TrashItemMetadata', TrashItemMetadataSchema)
