const Plant = require('../models/Plant.js');
const IndividualPlant = require('../models/IndividualPlant.js');
const PlantObservation = require('../models/PlantObservation.js');

const Mod = require('../models/Mod.js');

exports.getModMap = (req, res) => {
  Plant.find((err, plant) => {
  Mod.find((err, docs) => {
    IndividualPlant.find((err, individualPlant) =>{
    res.render('modules', { mods: docs , plants: plant, plantedPlants: individualPlant });
  });
  });
});

};

exports.getMod = (req, res, next) => {
  let x = req.params.x
  let y = req.params.y
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
              return res.render('module', { mods: docs, exists: false, mod: {tags: [], model: '', shape: '', orientation: '', notes: '', flipped: false}, plants: plant, x, y, tag: [] });
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
                return res.render('module', { mods: docs, exists: true, mod: module, plants: plant, x, y, plantedPlants: plantedplants });
              })
          });
      });
    })
};
//   Plant.find((err, plant) => {
//   Mod.find({ email: req.body.email },  (err, docs) => {
//     IndividualPlant.find((err, individualPlant) =>{
//     res.render('module', { mods: docs , plants: plant, plantedPlants: individualPlant, x:x,y:y });
//   });
//   });
// });

exports.postMod = (req, res, next) => {

var plantLocations = req.body.individualPlants || '{}';
ip = JSON.parse(plantLocations)
var plant1 = req.body.plant1;
var plant2 = req.body.plant2;
var plant3 = req.body.plant3;
var plant4 = req.body.plant4;
var plant5 = req.body.plant5;

console.log(req.body, 'etuhe', Object.values(ip), plant1,plant2,plant3)



const mod = new Mod({
  x: req.body.x,
  y: req.body.y,
  model: req.body.model,
  shape: req.body.shape,
  orientation: req.body.orientation,
  flipped: req.body.flipped,
  notes: req.body.notes,
  tags: req.body.tags
});


mod.save((err, newmod) => {
  if (err) { return next(err); }
    for ( x in ip) {
    data = ip[x]
    if (data.selection == 1) {
      p = plant1
    }
    if (data.selection == 2) {
      p = plant2
    }
    if (data.selection == 3) {
      p=plant3
    }
    if (data.selection == 4) {
      p=plant4
    }
    if (data.selection == 5) {
      p=plant5
    }
    console.log(ip[x]);

    const plantPlacement = new IndividualPlant({
      plant: p,
      x: data.location.x,
      y: data.location.y,
      module: newmod.id,
    })
    plantPlacement.save((err) => {
      if (err) { return next(err); }
      });
    }
    req.flash('success', { msg: 'Module added',plantLocations, plant1,plant2,plant3 });
    res.redirect('/module/' + mod.x + '&' + mod.y);

});



// Mod.find({ x: req.body.x, y: req.body.y  }, (err, existingUser) => {
//   if (err) { return next(err); }
//   if (existingUser) {
//     req.flash('errors', { msg: 'Module Already Exists... Please edit instead' });
//     return res.redirect('/module');
//   }
//   mod.save((err) => {
//     if (err) { return next(err); }
//       res.redirect('/module');
//   });
// });
};

exports.postDeleteMod = (req, res, next) => {
  Mod.deleteOne({ _id: req.params.id }, (err) => {
    if (err) { return next(err); }
    req.flash('info', { msg: 'Module Removed.' });
    res.redirect('/modmap');
  });
};

exports.postUpdateMod = (req, res, next) => {

  Mod.findById(req.body.id, (err, mod) => {
    if (err) { return next(err); }
    mod.x = req.body.x || '';
    mod.y = req.body.y || '';
    mod.model = req.body.model || '';
    mod.shape = req.body.shape || '';
    mod.notes = req.body.notes || '';
    mod.flipped = req.body.flipped || '';
    mod.tags = req.body.tags || [];

    mod.save((err) => {
      if (err) {
        if (err) {}
        return next(err);
      }
      req.flash('success', { msg: 'updated.' });
      res.redirect('/module/' + mod.x + '&' + mod.y);
    });
  });
};

exports.postPlantLayout = (req, res, next) => {

  arr = [{}]
  IndividualPlant.insertMany(arr, function(error, docs) {});

//   Mod.find({ x: req.body.x, y: req.body.y }, (err, mod) => {
//     if (err) { return next(err); }
// // figure this out
//     for n in req.body.allPlants => {
//
//       Plant.findOne({ scientificName: req.body.xxx }, (err, mod) => {
//         if (err) { return next(err); }
//
//     const individualPlant = new IndividualPlant({
//       plant:
//       x: req.body.x, //how do you reference multiple items
//       y: req.body.y,
//       module: mod._id,
//       supplier: req.body.supplier,
//     });
//
//   individualPlant.save((err) => {
//     if (err) { return next(err); }
//   });
//   };
// });
};
