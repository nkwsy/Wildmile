import mongoose from 'mongoose'

const SectionSchema = new mongoose.Schema({
  name: String,
  description: String,
  dateInstalled: Date,
  installed: Boolean,
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
})

export default mongoose.models.Section || mongoose.model('Section', SectionSchema)
