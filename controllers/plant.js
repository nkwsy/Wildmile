/**
 * GET /plants
 * List all plants.
 */
const Plant = require('../models/Plant.js');

exports.getPlants = (req, res) => {
  Plant.find((err, docs) => {
    res.render('plants', { plants: docs });
  });
};

exports.getPlantsAdmin = (req, res) => {
  Plant.find((err, docs) => {
    res.render('plantsadmin', { plants: docs });
  });
};

exports.postPlantsAdmin = (req, res, next) => {

const plant = new Plant({
  scientificName: req.body.scientificName,
  commonName: req.body.commonName,
  notes: req.body.notes,
  botanicPhoto: req.body.botanicPhoto,
  tags: req.body.tags
});

Plant.findOne({ scientificName: req.body.scientificName }, (err, existingUser) => {
  if (err) { return next(err); }
  if (existingUser) {
    req.flash('errors', { msg: 'Plant Already Exists...' });
    return res.redirect('/plantsadmin');
  }
  plant.save((err) => {
    if (err) { return next(err); }

      res.redirect('/plantsadmin');
  });
});
};

exports.postDeletePlant = (req, res, next) => {
  console.log('deleting');
  Plant.deleteOne({ _id: req.params.id }, (err) => {
    if (err) { return next(err); }
    req.flash('info', { msg: 'Plant Removed.' });
    res.redirect('/plants');
  });
};
