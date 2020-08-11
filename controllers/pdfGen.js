//Instructions Generator
const Plant = require('../models/Plant.js');
const IndividualPlant = require('../models/IndividualPlant.js');
const PlantObservation = require('../models/PlantObservation.js');
const Mod = require('../models/Mod.js');
const mongoose = require('mongoose');
const { jsPDF } = require("jspdf"); // will automatically load the node version

const doc = new jsPDF();

exports.getPdf = (req, res) => {
  Plant.find((err, plant) => {
  Mod.find((err, docs) => {
    IndividualPlant.find((err, individualPlant) =>{
    res.render('pdf', { mods: docs , plants: plant, plantedPlants: individualPlant });
  });
  });
});
};

tg = ['a']

function getP() {
const pnum =
 Mod
  .find({x:200,y:1 })
  .distinct('_id')
  .exec((err, usedMods) => {
    if (err) { return next(err); }
    let tagMods =  new Array();
    console.log(tagMods);
    let search = '_id'
    for (let i = 0; i < usedMods.length; i++) {
      if (usedMods[i]) {
        let search = 'module';
        tagMods.push(mongoose.Types.ObjectId(usedMods[i]));
      }
      else {
        tagMods = {};
      }
    }
    console.log('tagmods',tagMods);
    IndividualPlant
      .aggregate([
        {
          $match : { 'module': { $in: tagMods}}
        },
        { $group: {_id: "$plant", count:{$sum:1}}},
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
        if (err) { return next(err);}
    m = JSON.stringify(data);
    const result = 'm'
    return result

  });
});
return pnum
};

var generateData = function(amount) {
  var result = [];
  var data = {
    num: "100",
    scientific_name: "GameGroup",
    common_name: "XPTO2",
  };
  for (var i = 0; i < amount; i += 1) {
    data.id = (i + 1).toString();
    result.push(Object.assign({}, data));
  }
  return result;
};

function createHeaders(keys) {
  var result = [];
  for (var i = 0; i < keys.length; i += 1) {
    result.push({
      id: keys[i],
      name: keys[i],
      prompt: keys[i],
      width: 65,
      align: "center",
      padding: 0
    });
  }
  return result;
}

var headers = createHeaders([
  "id",
  "num",
  "scientific_name",
  "common_name",
]);

let moduleX = "200"
let moduleY = "2"
let tb = [{quantity:'32',plant:'test1'},{quantity:'32',plant:'test2'},{quantity:'32',plant:'test3',}]

function getPdf(){
  console.log(getP();,'opi');

  doc.setTextColor('#ffffff')
  doc.rect(10,10,24,50, style='F');
  doc.rect(10,10,65,50);
  doc.setFontSize(60);
  doc.text("X\nY", 15, 30);
  doc.setTextColor('#000000')
  doc.text(moduleX+'\n'+moduleY, 35, 30);
  doc.table(84, 10, generateData(5), headers, { autoSize: true });
  doc.save("a4.pdf"); // will save the file
}
getPdf();
