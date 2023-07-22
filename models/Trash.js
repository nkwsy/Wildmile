const mongoose = require('mongoose');
const mongoose_delete = require('mongoose-delete');

const { Schema } = mongoose;

const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true
  },
  coordinates: {
    type: [Number],
    required: true
  }
});
const polygonSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Polygon'],
    required: true
  },
  coordinates: {
    type: [[[Number]]], // Array of arrays of arrays of numbers
    required: true
  }
});


const trashLogSchema = new mongoose.Schema({
// Supporting Info
  site: String,
  date: Date,
  timeStart: Date,
  timeEnd: Date,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
  numOfParticipants: Number,
  participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  unattributed: Boolean,
  area: polygonSchema,
  notes: String,
  weight: Number,
  trashiness: Number,
  temp: Number,
  wind: Number,
  cloud: Number

  //weather: String, TODO find API to calculate
}, { timestamps: true });

trashLogSchema.plugin(mongoose_delete, { overrideMethods: true });

const TrashLog = mongoose.model('TrashLog', trashLogSchema);
// module.exports = TrashLog;

const trashItemSchema = new mongoose.Schema({
  name: String,
  material: String,
  catagory: { type: String, index: true },
  description: String,
  photo: String,
  averageWeight: Number,
  floats: Boolean,
  creator: { type: Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

trashItemSchema.index({ name: 1, type: -1 });
trashItemSchema.plugin(mongoose_delete, { overrideMethods: true });

const TrashItem = mongoose.model('TrashItem', trashItemSchema);
// module.exports = TrashItem;

const individualTrashItemSchema = new mongoose.Schema({
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
  generic: { type: Boolean, default: true },
  creator: { type: Schema.Types.ObjectId, ref: 'User' }, // This seems redundant since there is a creator on the trashlog itself
}, { timestamps: true });

individualTrashItemSchema.plugin(mongoose_delete, { overrideMethods: true });
const IndividualTrashItem = mongoose.model('IndividualTrashItem', individualTrashItemSchema);

trashLogSchema.virtual('items', {
  ref: 'IndividualTrashItem', // The model to use
  localField: '_id', // Find people where `localField`
  foreignField: 'logId', // is equal to `foreignField`
  justOne: false,
  options: { sort: { itemId: -1 } }
});

module.exports = {
  TrashItem,
  TrashLog,
  IndividualTrashItem
};
// Individual Log
// has many items
//
// item
// has attributes
//   Name+Material
//   Name
//   Material
//   Quantity
//
// // TODO: Add system for live tracking / trash removal
