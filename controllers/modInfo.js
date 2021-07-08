const mongoose = require('mongoose');
const Plant = require('../models/Plant.js');
const IndividualPlant = require('../models/IndividualPlant.js');
const PlantObservation = require('../models/PlantObservation.js');
const Mod = require('../models/Mod.js');

exports.getModinfo = (req, res) => {
  Plant.find((err, plant) => {
    Mod.find((err, docs) => {
      IndividualPlant.find((err, individualPlant) => {
        res.render('modinfo', { mods: docs, plants: plant, plantedPlants: individualPlant });
      });
    });
  });
};

exports.findModInfo = (req, res, next) => {
  const x = req.params.x;
  const y = req.params.y;
  Plant
    .find()
    .exec((err, plant) => {
      Mod.find((err, docs) => {
        Mod
          .findOne({ x, y })
          .exec((err, module) => {
            if (err) { return next(err); }
            if (!module) {
              req.flash('info', { msg: 'Creating New Module' });
              return res.render('module', {
                mods: docs,
                exists: false,
                mod: {
                  model: '', shape: '', orientation: '', notes: '', flipped: false, locationCode: ''
                },
                plants: plant,
                x,
                y,
                tag: ''
              });
            }
            IndividualPlant
              .find({ module: module._id })
              .exec((err, plantedplants) => {
                if (err) { return next(err); }
                if (!plantedplants) {
                  req.flash('info', { msg: 'Editing Empty Module' });
                  return res.render('module', { plants: plant, x, y });
                }
                req.flash('info', { msg: 'Editing Module' });
                console.log('plantedPlants', plantedplants);

                return res.render('modinfo', {
                  mods: docs, exists: true, mod: module, plants: plant, x, y, plantedPlants: plantedplants
                });
              });
          });
      });
    });
};

exports.getModTags = (req, res, next) => {
  Mod
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
      IndividualPlant
        .aggregate([
          {
            $match: { module: { $in: tagMods } }
          },
          { $group: { _id: '$plant', count: { $sum: 1 } } },
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
          console.log('usedMods', usedMods);
          return res.send(data);
        });
    });
};
