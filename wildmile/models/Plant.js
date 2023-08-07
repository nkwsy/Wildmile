import mongoose from 'mongoose'

const plantSchema = new mongoose.Schema({
  scientific_name: { type: String, unique: true },
  common_name: String,
  family: String,
  family_common_name: String,
  genus: String,
  genus_id: Number,
  notes: String, 
  image_url: String,
  synonyms: Array,
  year: Number
}, { timestamps: true })

export default mongoose.models.Plant || mongoose.model('Plant', plantSchema)

