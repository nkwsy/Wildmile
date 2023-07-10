const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ModSchema = new mongoose.Schema({
  name: String,
  dateInstalled: Date,
  installed: Boolean,
  x: Number,
  y: Number,
  locationCode:String,
  location: {type: "String", coordinates: []},
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
  sponsor: { type: Schema.Types.ObjectId, ref: 'User' }

});

const Mod = mongoose.model('Mod', ModSchema);

const ProjectSchema = new mongoose.Schema({
  name: String,
  dateInstalled: Date,
  installed: Boolean,
  x: Number,
  y: Number,
  location: {type: "String", coordinates: []},
  section: String,
  orientation: String,
  shape: String,
  notes: String,
  flag: Boolean,
  flipped: Boolean,
  tags: Array,
  decommisioned: Boolean,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },

},{ timestamps: true });

const Project = mongoose.model('Project', ProjectSchema)

const SectionSchema = new mongoose.Schema({
  name: String,
  dateInstalled: Date,
  installed: Boolean,
  x: Number,
  y: Number,
  location: {type: "Point", coordinates:[]},
  project_id: {type: Schema.Types.ObjectId, ref: 'Project'}
})

const Section = mongoose.model('Section', SectionSchema)
module.exports = {
  Mod,
  Project,
  Section
};