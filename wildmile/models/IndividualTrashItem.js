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

const individualTrashItemSchema = new Schema({
  itemId: { type: Schema.Types.ObjectId, ref: 'TrashItem' },
  logId: { type: Schema.Types.ObjectId, ref: 'TrashLog' },
  quantity: Number,
  notes: String,
  location: pointSchema,
  tags: Array,
  generic: { type: Boolean, default: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User' }, // This seems redundant since there is a creator on the trashlog itself
}, { 
  timestamps: true, 
  strictPopulate: false, 
  toJSON: { virtuals: true }, 
  toObject: { virtuals: true }
})

export default mongoose.models.IndividualTrashItem || mongoose.model('IndividualTrashItem', individualTrashItemSchema)
