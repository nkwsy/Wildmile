import mongoose from 'mongoose'

const ModuleSchema = new mongoose.Schema({
  name: String,
  dateInstalled: Date,
  installed: Boolean,
  x: Number,
  y: Number,
  locationCode: String,
  location: { type: "String", coordinates: [] },
  section: String,
  installGroup: Number,
  model: String,
  orientation: String,
  shape: String,
  notes: String,
  flag: Boolean,
  flipped: Boolean,
  tags: Array,
  decommisioned: Boolean,
  sponsor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { collection: 'mods' })

export default mongoose.models.Module || mongoose.model('Module', ModuleSchema)
