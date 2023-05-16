///Modmap.js

let article = document.querySelector('#modMap');
console.log(article.dataset);
let data = JSON.parse(article.dataset.mods)

function b(scale= 1) {
  items = {modX: 20, modY: 60, plantX: 5, plantY: 6}
}
function getMod(data, x, y) {
  var i, len = data.length;

  for (i = 0; i < len; i++) {
    if (data[i]) {
      if (data[i]["y"] == y && data[i]["x"] == x) {
        return data[i]
      }
    }
  }

  return false;
}
function findColor(model) {
  if (model === '5-d') {
    return '#D68D5E' ;
  }
  else {
    return '#189968';
  }
}
// search by scientific name
function hashCode(str) {
  let hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}
function pickColor(str) {
  str = str.replace(/ .*/,'')
  return `hsl(${hashCode(str) % 550}, 80%, 80%)`;
}
function individualPlantMap(draw, individualPlant) {
  plantBoxX = 5
  plantBoxY = 6
  modX = 200 - individualPlant['module']['x']
  modY = individualPlant['module']['y']
  plantX = individualPlant['x']
  plantY = individualPlant['y']
  scientificName = individualPlant['plant']['scientificName']
  // var draw = SVG()
  // .addTo('#modMap')
  // .size(400, 3800)
  shape = draw.rect(5, 6).attr({
    fill: pickColor(scientificName),
    opacity: 1,
    x: (modY * 20) + (15 - (plantY * 5)),
    y: (modX * 60) + (plantX * 6)
  })
  shape.data('key', { 'plant': individualPlant['plant']['scientificName'], 'x': plantX, 'y': plantY, 'modX': modX, 'modY': modY })
        shape.mouseenter(function () {
        this.stroke({
          color: '#5ECCA2'
        })
        let infoBox = document.getElementById('infoText');
        let data = this.data('key');
        infoBox.innerText = data['plant'] + ' ' + data['x'] + ' ' + data['y'];
        // infoBox.innerText = data;
      })
      shape.mouseout(function () {
        this.stroke({
          opacity:0.01
          // color: ''
        })
        // infoBox.innerText = data;
      })
  }

function drawPlants(draw) {
  var article = document.querySelector('#modMap');
  // var allMods = JSON.parse(article.dataset.mods);
  var allPlants = JSON.parse(article.dataset.plantedplants);
  console.log('allPlants: ', allPlants);
  for (var i = 0; i < allPlants.length; i++) {
    individualPlantMap(draw, allPlants[i]);
  }
};

function modMap(draw) {
var article = document.querySelector('#modMap');
  var allMods = JSON.parse(article.dataset.mods);
  // var allPlants = JSON.parse(article.dataset.plantedPlants);
  var defaultColor = 'grey'
  console.log('allMods: ', allMods);

  //var rect = draw.rect(60, 20).attr({ fill: '#189968' }).stroke({ color: '#5ECCA2',  width: 2 })
  var wide = 30;
  for (var n = 0; n < 45; n++) {
    for (var i = 0; i < 16; i++) {
      let shape;
      color = '#189968'
      var x = 200 - n
      var y = i

      const mod = getMod(allMods, x, i)
      if (mod) {
        var defaultColor = findColor(mod['model'])
        var op = 0.01
        var id = mod['_id']

        if (mod['shape'] === 'R3' || mod['shape'] === "R2.3" ) {
          shape = draw.rect(20, 60).attr({
            fill: defaultColor,
            opacity: op,
            x: i * 20,
            y: n * 60
          }).data('key', {
            id, id,
            x,
            y
          }).stroke({
            color: '#5ECCA2',
            width: 1
          })
        }
        if (mod['shape'] === 'T3' || mod['shape'] === "T2.3") {
          const {flipped} = mod;
          const topLeft = `${i * 20},${n * 60}`;
          const topRight = `${(i+1) * 20},${n * 60}`;
          const bottomLeft = `${(i) * 20},${(n+1) * 60}`;
          const bottomRight = `${(i+1) * 20},${(n+1) * 60}`;

          let coordinates;

          if (mod['orientation'] === 'RH') {
            coordinates = [topRight, bottomLeft];

            coordinates.push(flipped ? bottomRight : topLeft);
          } else if (mod['orientation'] === 'LH') {
            coordinates = [topLeft, bottomRight];

            coordinates.push(flipped ? topRight : bottomLeft);
          } else if (mod['orientation'] === 'flat') {
            // triangles can't be flat... we should either not let this
            // happen or we should yell at the user more
            coordinates = [topRight, bottomLeft, topLeft];

            defaultColor = '#C73316';
          }

          shape = draw.polygon(coordinates.join(' ')).attr({
            fill: defaultColor,
            opacity: op,
            x: i * 20,
            y: n * 60
          }).data('key', {
            id, id,
            x,
            y
          }).stroke({
            color: '#5ECCA2',
            width: 1
          });
        }
      } else {
        defaultColor = 'white'
        op = 1
        shape = draw.rect(20, 60).attr({
          fill: defaultColor,
          opacity: op,
          x: i * 20,
          y: n * 60
        }).data('key', {
          id, id,
          x,
          y
        }).stroke({
          color: '#5ECCA2',
          width: 1
        })
      }

      var g = i * 20
      var h = n * 60

      shape.click(function () {
        // document.getElementById("x").value = this.data('key')["x"];
        // document.getElementById("y").value = this.data('key')["y"];
        modpage = 'module/'+this.data('key')["x"]+'&'+this.data('key')["y"];
        window.location.href = modpage;
        drawMod(mod["shape"], mod["id"])
        this.fill({
          color: color
        })
        var a = this.data('key')["n"]
        console.log(a);
      })

    }
    var local = x;
    var text = draw.text(local.toString()).attr({
      opacity: op,
      x: i * 20 - 6,
      y: n * 60 + 12
    }).rotate(90);
  }
  return draw;
};

window.onload = function () {
  // draw = SVG().addTo('#modMap').size(400, 3800)
  const draw = SVG().addTo('#modMap').size(400, 3800)

  modMap(draw);
  drawPlants(draw);
};
