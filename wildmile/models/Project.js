import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema({
    name: { type: String, unique: true },
    description: String,
    notes: String,
    decommisioned: Boolean,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },{ timestamps: true });

  export default mongoose.models.Project || mongoose.model('Project', ProjectSchema)
