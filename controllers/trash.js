/**
 * GET /trash
 * List all trash.
 */
const {TrashItem} = require('../models/Trash.js');
const {TrashLog} = require('../models/Trash.js');
const {IndividualTrashItem} = require('../models/Trash.js');

function trashItemSplit(logId, itemId, quantity, aggrigateWeight, creator, options = []) {
allItems = [];
for (var i = 0; i < itemId.length; i++) {
for (var n = 0; n < quantity[i]; n++) {
  //Find if there is an individual weight, create formula for that
  weight = (aggrigateWeight[i] / quantity[i]);
  if (weight == 0) {
    weight = undefined;
  }
let newItem = {
  itemId: itemId[i],
  logId: logId,
  // quantity: Number,
  // notes: options.notes[n] || '',
  // location: options.itemId[i].location[n] || '',
  // photo: String,
  weight: weight,
  // waterlogged: Boolean,
  // aggrigateWeight: Number,
  // tags: Array,
  creator: creator

}
allItems.push(newItem)

}
}
return allItems;
 }
exports.getTrash = (req, res) => {
    res.render('trash/trash');
};

exports.getTrashLog = (req, res) => {
  TrashLog
    .findOne({ logId: req.params.logId })
    .exec((err, docs) => {
      if (err) { console.log(err); }
      TrashItem
      .find()
      // .populate('itemId')
      .exec((err, items) => {

        res.render('trash/trashLog', { trashLogs: docs || '', trashItems: items });
      });
    });
  }

exports.postTrashLog = (req, res, next) => {
  let startTime = req.body.date + ' ' + req.body.timeStart;
  let endTime = req.body.date + ' ' + req.body.timeEnd
  let allTrashItems = trashItemSplit(req.params.logId, req.body.itemId, req.body.quantity, req.body.aggrigateWeight, req.user.id);
  console.log(allTrashItems);
  IndividualTrashItem.insertMany(allTrashItems, onInsert);
  function onInsert(err, docs) {
    if (err) {
      console.log(err);
      } else {
      console.info('%d potatoes were successfully stored.', docs.length);
      req.flash('info', { msg: 'Trash has been logged' });
        return res.redirect('/trash');
        }
      }
    }

exports.postDeleteTrashLog = (req, res, next) => {
  console.log(req.params.logId);
  TrashLog.delete({ _id: req.params.logId }, (err) => {
    if (err) { console.log(err);return next(err); }
    IndividualTrashItem.delete({ logId: req.params.logId }, (err) => {
    req.flash('info', { msg: 'Module Removed.' });
    res.redirect('/trash');
  });
  });
};


exports.getTrashLogs = (req, res) => {
  TrashLog.find((err, docs) => {
    res.render('trash/trashLogs', { trashLogs: docs });
  });
};

exports.postNewTrashLog = (req, res, next) => {
let startTime = req.body.date + ' ' + req.body.timeStart;
let endTime = req.body.date + ' ' + req.body.timeEnd;
const trashLog = new TrashLog({
  site: req.body.site,
  timeStart: startTime,
  timeEnd: endTime,
  creator: req.user.id,
  unattributed: req.body.unattributed || false,
  // participants: req.body.participants || [''],
  numOfParticipants: req.body.numOfParticipants,
  notes: req.body.notes || ''

});
trashLog.save(function(err,currentLog) {
   console.log(`new Trash Log: ${trashLog}`);
   return res.redirect(`/trash/trashLog/${trashLog._id}`);
});
}

exports.getTrashItems = (req, res) => {
  TrashItem.find((err, docs) => {
    res.render('trash/trashItems', { trashItems: docs });
  });
};

exports.postTrashItem = (req, res, next) => {

const trashItem = new TrashItem({
  name: req.body.name,
  material: req.body.material,
  catagory: req.body.catagory,
  description: req.body.description,
  // floats: Boolean || '',
  creator: req.user.id
});
  trashItem.save((err) => {
    if (err) { return next(err); }
      res.redirect('/trash/trashItems');
  });
};
