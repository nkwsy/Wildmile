/**
 * GET /trash
 * List all trash.
 */
const {TrashItem} = require('../models/Trash.js');
const {TrashLog} = require('../models/Trash.js');
const {IndividualTrashItem} = require('../models/Trash.js');

exports.getTrash = (req, res) => {
    res.render('trash');
};

exports.getTrashLog = (req, res) => {
  TrashLog
    .findOne({ logId: req.params.logId })
    .exec((err, docs) => {
      TrashItem.find({logId:req.params.logId})
      // .populate('itemId')
      .exec((err, items) => {
        res.render('trash/trashLog', { trashLogs: docs || '', trashItems: items });
      });
    });
  }

  exports.postTrashLog = (req, res, next) => {

  const trashLog = new TrashLog({
    site: req.body.site,
    timeStart: req.body.timeStart,
    timeEnd: req.body.timeEnd,
    creator: req.user.id,
    unattributed: Boolean || false,
    // participants: req.body.participants || [''],
    numOfParticipants: req.body.numOfParticipants,
    notes: req.body.notes || '',

  });
  trashLog.save(function(err,currentLog) {
     console.log('new Trash Log: ',currentLog._id);
     return res.redirect(`/trash/trashLog/${currentLog._id}`);
  });
  }

exports.getTrashLogs = (req, res) => {
  TrashLog.find((err, docs) => {
    res.render('trash/trashLogs', { trashLogs: docs });
  });
};

exports.postNewTrashLog = (req, res, next) => {

const trashLog = new TrashLog({
  site: req.body.site,
  timeStart: req.body.timeStart,
  timeEnd: req.body.timeEnd,
  creator: req.user.id,
  unattributed: Boolean || false,
  participants: req.body.participants || [''],
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
      res.redirect('trash/trashItems');
  });
};
