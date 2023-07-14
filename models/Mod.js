const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');

const Schema = mongoose.Schema;

const geoSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'], // 'location.type' must be 'Point'
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});

const ModSchema = new mongoose.Schema({
  name: String,
  dateInstalled: Date,
  installed: Boolean,
  x: Number,
  y: Number,
  locationCode:String,
  location: geoSchema,
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

ModSchema.plugin(mongoose_delete, { overrideMethods: true });
const Mod = mongoose.model('Mod', ModSchema);

const ProjectSchema = new mongoose.Schema({
  name: String,
  dateInstalled: Date,
  installed: Boolean,
  x: Number,
  y: Number,
  location: geoSchema,
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

ProjectSchema.plugin(mongoose_delete, { overrideMethods: true });
const Project = mongoose.model('Project', ProjectSchema)

const SectionSchema = new mongoose.Schema({
  name: String,
  code: String,
  dateInstalled: Date,
  installed: Boolean,
  x: Number,
  y: Number,
  notes: String,
  tags: Array,
  location: geoSchema,
  bearing: {type:"Number"},
  projectId: {type: Schema.Types.ObjectId, ref: 'Project'}
})

SectionSchema.plugin(mongoose_delete, { overrideMethods: true });
const Section = mongoose.model('Section', SectionSchema)

module.exports = {
  Mod,
  Project,
  Section
};