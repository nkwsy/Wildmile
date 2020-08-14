//Instructions Generator
const Plant = require('../models/Plant.js');
const IndividualPlant = require('../models/IndividualPlant.js');
const PlantObservation = require('../models/PlantObservation.js');
const Mod = require('../models/Mod.js');
const mongoose = require('mongoose');
const {
  jsPDF
} = require("jspdf"); // will automatically load the node version

const doc = new jsPDF();

exports.getPdf = (req, res) => {
  Plant.find((err, plant) => {
    Mod.find((err, docs) => {
      IndividualPlant.find(async (err, individualPlant) => {
        getPdf(),
        res.render('pdf', {
          mods: docs,
          plants: plant,
          plantedPlants: individualPlant
        });
      });
    });
  });
};

tg = ['a']

async function getPlantsArray() {
  // 1console.log('P')
  const plantsArray = await Mod
    .find({
      x: 200,
      y: 1
    })
    .distinct('_id')
    .then(async(usedMods, err) => {
      // 1console.log('usedMods: ', usedMods);
      if (err) {
        return err;
      }
      let tagMods = new Array();
      // 1console.log(tagMods);
      let search = '_id'
      for (let i = 0; i < usedMods.length; i++) {
        if (usedMods[i]) {
          let search = 'module';
          tagMods.push(mongoose.Types.ObjectId(usedMods[i]));
        } else {
          tagMods = {};
        }
      }
      // 1console.log('tagmods', tagMods);
    return await  IndividualPlant
        .aggregate([{
            $match: {
              'module': {
                $in: tagMods
              }
            }
          },

          {
            $lookup: {
              from: 'plants',
              localField: '_id',
              foreignField: '_id',
              as: 'plants'
            },
          },
          { $sort : { count : -1 } }
          // { "$unwind": { "path" : "$_id" } },
        ]).then((err, data) => {
          if (err) {
            return err;
          }
          m = JSON.stringify(data);
          const result = m
          // 1console.log('result: ', result[0].plants);
          return result[0].plants;

        });
    });
  return plantsArray;
};

async function modInfo(tag) {
  const mInfo = await Mod
  .find({tags: tag})
  .then(async(module, err) =>{
    if (err){return null}
    return module});
    return mInfo;
};

async function allModInfo() {
  const mInfo = await Mod
  .find()
  .then(async(module, err) =>{
    if (err){return null}
    return module});
    return mInfo;
};
async function getP(x,y) {
  // 1console.log('P')
  const pnum = await Mod
    .find({
      x: x,
      y: y
    })
    .distinct('_id')
    .then(async(usedMods, err) => {
      // 1console.log('usedMods: ', usedMods);
      if (err) {
        return err;
      }
      let tagMods = new Array();
      // 1console.log(tagMods);
      let search = '_id'
      for (let i = 0; i < usedMods.length; i++) {
        if (usedMods[i]) {
          let search = 'module';
          tagMods.push(mongoose.Types.ObjectId(usedMods[i]));
        } else {
          tagMods = {};
        }
      }
      // 1console.log('tagmods', tagMods);
    return await  IndividualPlant
        .aggregate([{
            $match: {
              'module': {
                $in: tagMods
              }
            }
          },
          // {$merge:{into: "coordinate", on:["x","y"]}},
          {
            $group: {
              _id: "$plant",
              count: {
                $sum: 1
              },
              // y:{$addToSet: "$y"},
              // x:{$addToSet: "$x"},
              xy: {$push: { y:"$y",x:"$x"} }
            }
          },
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
              plantId: "$plants._id",
              notes: "$module.notes",
              //x:  {$concatArrays: [ "$x"]},
              xy: "$xy"
            }
          },
          { $sort : { plantName : 1 } }
          // { "$unwind": { "path" : "$_id" } },
        ]).then((err, data) => {
          if (err) {
            return err;
          }
          m = JSON.stringify(data);
          const result = m
          // 1console.log('result: ', result.x);
          return result

        });
    });
  return pnum
};

async function eliminateBrackets(brackets, orientation, flipped){
if (orientation === 'RH' && flipped === false) {
  brackets.tr = false; brackets.rt = false; brackets.rb = false;
}
else if (orientation === 'LH' && flipped === false) {
  brackets.tl = false; brackets.lt = false; brackets.lb = false;
}
else if (orientation === 'RH' && flipped === true) {
  brackets.bl = false; brackets.lt = false; brackets.lb = false;
}
else if (orientation === 'LH' && flipped === true) {
  brackets.rt = false; brackets.rb = false; brackets.br = false;
}
};

async function bracketFinder(x, y, orientation, flipped) {
  const allMods = await allModInfo();
  let brackets  = {lt:false,tl:false,tr:false,rt:false,rb:false,br:false,bl:false,lb:false};
  bracketCount = 0
  const modsToCheck = {  left : x + 1, right : x - 1, top : y + 1, bottom : y - 1};
  for (var i = 0; i < allMods.length; i++) {
    cmod = allMods[i];
    if (cmod.x == modsToCheck.left && cmod.y == y )  {
      if (cmod.shape == 'R3' || cmod.shape =='R2.3'){brackets.lt = true, brackets.lb=true}
      else if (cmod.shape == 'T3'|| cmod.shape == 'T2.3') {
        // No connection at regular RH
        if (cmod.orientation == 'RH' && cmod.flipped == true || cmod.orientation == 'LH' && cmod.flipped == false) {
          brackets.lt = true, brackets.lb=true;
        }
      }
    };

    if (cmod.x == modsToCheck.right && cmod.y == y) {
      if (cmod.shape == 'R3' || cmod.shape =='R2.3'){ brackets.rt = true, brackets.rb=true}
      else if (cmod.shape == 'T3'|| cmod.shape == 'T2.3') {
        // No connection at regular RH
        if (cmod.orientation == 'RH' && cmod.flipped == false || cmod.orientation == 'LH' && cmod.flipped == true) {
          brackets.lt = true, brackets.rb=true;
        }
      }
    };

    if (cmod.x == x && cmod.y == modsToCheck.top )  {
      if (cmod.shape == 'R3' || cmod.shape =='R2.3')
      {brackets.tl = true, brackets.tr=true;}
      else if (cmod.shape == 'T3'|| cmod.shape == 'T2.3') {
        // No connection at regular RH
        if (cmod.orientation == 'RH' && cmod.flipped == false || cmod.orientation == 'LH' && cmod.flipped == false) {
          brackets.tl = true, brackets.tl=true;
        }
        else if (cmod.orientation == 'RH' && cmod.flipped == true) {
          brackets.tr=true;
        }
        else if (cmod.orientation == 'LH' && cmod.flipped == true) {
          brackets.tl=true;
        }
      }
    }
    if (cmod.x == x && cmod.y == modsToCheck.bottom )  {
      if (cmod.shape == 'R3' || cmod.shape =='R2.3')
      {brackets.bl = true, brackets.br=true}
      else if (cmod.shape == 'T3'|| cmod.shape == 'T2.3') {
        // No connection at regular RH
        if (cmod.orientation == 'RH' && cmod.flipped == true || cmod.orientation == 'LH' && cmod.flipped == true) {
          brackets.bl = true, brackets.bl = true;
        }
        else if (cmod.orientation == 'RH' && cmod.flipped == false) {
          brackets.bl=true;
        }
        else if (cmod.orientation == 'LH' && cmod.flipped == false) {
          brackets.br=true;
        }
      }
    }
};

console.log('brackets: ',x,y,brackets);
  const finishedBrackets = await eliminateBrackets(brackets, orientation, flipped);
  return finishedBrackets
}

async function generateBrackets(moduleBrackets) {
  // lt:false,tl:false,tr:false,rt:false,rb:false,br:false,bl:false,lb:false
//  triangle(x1, y1, x2, y2, x3, y3, styleopt)
  doc.setLineWidth(2);
  let x1 = 24
  let y1 = 100
  let x2 = x1 + 156
  let y2 = y1 + 52
  bSize = 8;
  const thisModulesBrackets = moduleBrackets;
  // line(x1, y1, x2, y2, style)
  if (thisModulesBrackets.lt == true) {
    // doc.triangle(x1, y1, x1, y1 + 6, x1-6, y1 +3)
    doc.line(x1, y1, x1-bSize, y1);
  }
  if (thisModulesBrackets.tl == true) {
    doc.line(x1, y1, x1, y1-bSize);
  }
  if (thisModulesBrackets.tr == true) {
    doc.line(x2, y1, x2, y1-bSize);
  }
  if (thisModulesBrackets.rt == true) {
    doc.line(x2, y1, x2 +bSize, y1);
  }
  if (thisModulesBrackets.rb == true) {
    doc.line(x2, y2, x2+bSize, y2);
  }
  if (thisModulesBrackets.br == true) {
    doc.line(x2, y2, x2, y2+bSize);
  }
  if (thisModulesBrackets.bl == true) {
    doc.line(x1, y2, x1, y2 + bSize);
  }
  if (thisModulesBrackets.lb == true) {
    doc.line(x1, y2, x1-bSize, y2);
  }
  doc.setLineWidth(0);

}

async function drawModShape(shape,orientation,flipped) {
  let x1 = 24
  let y1 = 100
  let x2 = x1 + 156
  let y2 = y1 + 52
  let osx = 156; // offset X
  let osy = 52; // offset Y
  //Module
  if (shape == 'R3' || shape == 'R2.3') {
    doc.rect(x1, y1, osx, osy);
  }
  if (shape == 'T3' || shape == 'T2.3') {
    if (orientation === 'LH') {
      if (flipped=== true) {
        doc.triangle(x1, y1, x1, y2, x1, y1);
      }
      else {
        doc.triangle(x1, y2, x2, y2, x2, y1);
      }
    }
    if (orientation === 'RH') {
      if (flipped=== true) {
        doc.triangle(x1, y1, x2, y1, x2, y2);}
      else {
        doc.triangle(x1, y1, x1, y2, x2, y2);
      }
    }
  }
}

async function gettingModule(tag) {

  const minfo = await modInfo(tag);
  for (var i = 0; i < minfo.length; i++) {
    const plantTable = await gettingPlants(minfo[i].x,minfo[i].y);
    await generatePlants(minfo[i].x,minfo[i].y);
    const moduleBrackets = await bracketFinder(minfo[i].x,minfo[i].y);
    await generateBrackets(moduleBrackets);
    doc.setTextColor('#ffffff')
    // xy rectangle
    doc.rect(10, 10, 24, 50, style = 'F');
    doc.rect(10, 10, 65, 50);
    doc.setFontSize(60);
    doc.text("X\nY", 15, 30);
    // Mod number
    doc.setTextColor('#000000')
    doc.text(minfo[i].x + '\n' + minfo[i].y, 35, 30);
    //table
    doc.table(84, 10, plantTable, headers, {
      autoSize: true
    });
    // Mod model info
    doc.setFontSize(22);
    modModel = `${minfo[i].shape} ${minfo[i].model} ${minfo[i].orientation}`
    doc.text(modModel, 15, 70);
    // draw module Shape
    await drawModShape(minfo[i].shape, minfo[i].orientation, minfo[i].flipped);

    //text box
    doc.text('Notes',118,174, {baseline: 'bottom'})
    doc.setLineWidth(2);
    doc.rect(118,174, 65, 40);
    doc.setLineWidth(0);
    doc.setFontSize(14);
    doc.text(minfo[i].notes, 120,176, {baseline:'top', maxWidth: 64})
    // 1// 1console.log('minfo',minfo);
    minfo[i]
  //adds new page to document
  doc.addPage();
}
}
async function gettingPlants(x,y) {
  thePlants = []
  const ppp = await getP(x,y)
  let plantLength = ppp.length;
  for (var i = 0; i < ppp.length; i++) {
    x = {id:i.toString(),
    scientific_name:ppp[i].plantName[0],
    num:ppp[i].count.toString(),
    notes:' '}
    // "common_name":ppp[i].commonName[0]}
    thePlants.push(x);
  }
  return thePlants;
}
var generateData = async function() {
  var result = [];
  var data = {
    num: "300",
    scientific_name: "GameGroup",
    common_name: "XPTO2",
  };
  for (var i = 0; i < 3; i += 1) {
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
  "scientific_name",
  "num",
  "notes"
  // "common_name",
]);

async function generatePlants(x,y) {
  const gp = await getP(x,y);
  for (var i = 0; i < gp.length; i++) {
    gp[i];
    for (var j = 0; j < gp[i].xy.length; j++) {
      // 1// 1console.log(gp[i].xy[j]);
      plantPlacement = gp[i].xy[j];
      leftMargin = 24 +5;
      topMargin = 100 +3;
      radius = 5;
      x = leftMargin + radius+ (plantPlacement.x *15)
      y = topMargin + radius + (plantPlacement.y *12);
      doc.setFont('Helvetica','Bold')
      doc.setFontSize(20)
      doc.text(i.toString(),x,y,{align: 'center', baseline: 'middle'});
      doc.circle(x, y, 5,);
    }
  }
  return
}
async function getPdf() {
  await gettingModule('c1');

  doc.save("a4.pdf"); // will save the file
}
async function test() {
  // 1console.log(await generateData);

}
test();
// 1console.log( doc.getFontList());
