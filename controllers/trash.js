/**
 * GET /trash
 * List all trash.
 */
const mongoose = require('mongoose');

const { TrashItem } = require('../models/Trash.js');
const { TrashLog } = require('../models/Trash.js');
const { IndividualTrashItem } = require('../models/Trash.js');
//Deteted aggrigateWeight
function trashItemSplit(logId, itemId, quantity, creator, options = []) {
  allItems = [];
  for (let i = 0; i < itemId.length; i++) {
    for (let n = 0; n < quantity[i]; n++) {
      // Find if there is an individual weight, create formula for that
//      weight = (aggrigateWeight[i] / quantity[i]);
//      if (weight == 0) {
//        weight = undefined;
//      }
      const newItem = {
        itemId: itemId[i],
        logId,
        // quantity: Number,
        // notes: options.notes[n] || '',
        // location: options.itemId[i].location[n] || '',
        // photo: String,
//        weight,
        // waterlogged: Boolean,
        // aggrigateWeight: Number,
        // tags: Array,
        creator

      };
      allItems.push(newItem);
    }
  }
  return allItems;
}
exports.getTrash = (req, res) => {
  res.render('trash/trash');
};

exports.getTrashLog = (req, res) => {
  TrashLog
    .findOne({ _id: req.params.logId })
    .exec((err, docs) => {
      if (err) { console.log(err); }
      TrashItem
        .find()
      // .populate('itemId')
        .exec((err, items) => {
          IndividualTrashItem
            .find({ logId: req.params.logId })
            .exec((err, individualItems) =>
              res.render('trash/trashLog', { trashLogs: docs || '', trashItems: items, individualItems }));
        });
    });
};

exports.getTrashLogAPI = (req, res) => {
  TrashLog
    .findOne({ _id: req.params.logId })
    .exec((err, docs) => {
      if (err) { console.log(err); }
      TrashItem
        .find()
      // .populate('itemId')
        .exec((err, items) => {
          IndividualTrashItem
            .find({ logId: req.params.logId })
            .exec((err, individualItems) =>
              res.render('trash/trashLog', { trashLogs: docs || '', trashItems: items, individualItems }));
        });
    });
};
exports.postClearLogItems = (req, res, next) => {
  let logId = req.params.logId;
  IndividualTrashItem.deleteMany({  logId: logId}, (err, result) => {
    if (err) { return }
    console.log('deleting individualTrashItems before update: ', result);
    return next();
  });
}
exports.postTrashLog = (req, res, next) => {
  const startTime = `${req.body.date} ${req.body.timeStart}`;
  const endTime = `${req.body.date} ${req.body.timeEnd}`;
//  const allTrashItems = trashItemSplit(req.params.logId, req.body.itemId, req.body.quantity, req.body.aggrigateWeight, req.user.id);
  const allTrashItems = trashItemSplit(req.params.logId, req.body.itemId, req.body.quantity, req.user.id);
  console.log('all trash items', allTrashItems, req.params.logId);
  IndividualTrashItem.insertMany(allTrashItems, onInsert);
  function onInsert(err, docs) {
    if (err) {
      console.log(err);
    } else {
      console.info('%d potatoes were successfully stored.', docs.length);
      req.flash('info', { msg: 'Trash has been logged' });
      return res.redirect('/trash/trashLogs');
    }
  }
};

exports.postDeleteTrashLog = (req, res, next) => {
  console.log(req.params.logId);
  TrashLog.delete({ _id: req.params.logId }, (err) => {
    if (err) { console.log(err); return next(err); }
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
  const startTime = `${req.body.date} ${req.body.timeStart}`;
  const endTime = `${req.body.date} ${req.body.timeEnd}`;
  const trashLog = new TrashLog({
    site: req.body.site,
    timeStart: startTime,
    timeEnd: endTime,
    creator: req.user.id,
    trashiness: req.body.trashiness,
    temp: req.body.temp,
    wind: req.body.wind,
    cloud: req.body.cloud,
    unattributed: req.body.unattributed || false,
    // participants: req.body.participants || [''],
    numOfParticipants: req.body.numOfParticipants,
    notes: req.body.notes || ''

  });
  trashLog.save((err, currentLog) => {
    console.log(`new Trash Log: ${trashLog}`);
    return res.redirect(`/trash/trashLog/${trashLog._id}`);
  });
};

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

exports.getTrashInfo = (req, res) => {
  TrashLog.find((err, trashLog) => {
    TrashItem.find((err, trashItem) => {
      IndividualTrashItem.find((err, individualTrashItem) => {
        console.log(trashLog);
        res.render('trash/trashInfo', { trashLog, trashItem, individualTrashItem });
      });
    });
  });
};

exports.getTrashLogInfo = (req, res, next) => {
  IndividualTrashItem
    .aggregate([
      { $group: { _id: '$tags' } }
    ]).exec((err, data) => {
      if (err) { return next(err); }
      console.log('all Mod Tags', data);
      return res.send(data);
    });
};

exports.updateModInfo = (req, res, next) => {
  const tag = req.query.tags;
  if (!tag) {
    console.log('No tags selected in search');
  }
  Mod
    .find({ tags: tag })
    .distinct('_id')
    .exec((err, usedMods) => {
      if (err) { return next(err); }
      let tagMods = new Array();
      console.log(tagMods);
      const search = '_id';
      for (let i = 0; i < usedMods.length; i++) {
        if (usedMods[i]) {
          const search = 'module';
          tagMods.push(mongoose.Types.ObjectId(usedMods[i]));
        } else {
          tagMods = {};
        }
      }
      console.log('tagmods', tagMods);
      IndividualTrashItem
        .aggregate([
          {
            $match: { logId: { $in: logId } }
          },
          { $group: { _id: '$itemId', count: { $sum: 1 } } },
          {
            $lookup: {
              from: 'plants',
              localField: '_id',
              foreignField: '_id',
              as: 'plants'
            },
          },
          {
            $project: {
              _id: 1,
              count: 1,
              plantName: '$plants.scientificName',
              commonName: '$plants.commonName',
              module: '$module._id'
            }
          }
          // { "$unwind": { "path" : "$_id" } },
        ]).exec((err, data) => {
          if (err) { return next(err); }
          // console.log(JSON.stringify(data));
          console.log('TrashLogged', usedMods);
          return res.send(data);
        });
    });
};
