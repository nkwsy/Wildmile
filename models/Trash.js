const mongoose = require('mongoose');

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
  notes: String
}, { timestamps: true });


const TrashLog = mongoose.model('TrashLog', trashLogSchema);
// module.exports = TrashLog;

const trashItemSchema = new mongoose.Schema({
  name: String,
  material: String,
  catagory: String,
  description: String,
  photo: String,
  averageWeight: Number,
  floats: Boolean,
  creator: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

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
  creator: { type: Schema.Types.ObjectId, ref: 'User' }

}, { timestamps: true });

const IndividualTrashItem = mongoose.model('IndividualTrashItem', individualTrashItemSchema);
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
