import mongoose from 'mongoose'
const Schema = mongoose.Schema

const individualPlantSchema = Schema({
  plant: { type: Schema.Types.ObjectId, ref: 'Plant' },
  x: Number,
  y: Number,
  module: { type: Schema.Types.ObjectId, ref: 'Mod' },
  supplier: String,
  datePlanted: Date,
  sponsor: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true })

export default mongoose.models.IndividualPlant || mongoose.model('IndividualPlant', individualPlantSchema)
