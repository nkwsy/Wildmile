///sectionMap.js

let article = document.querySelector('#sectionMap');
console.log(article.dataset);
let data = JSON.parse(article.dataset.mods)

function b(scale = 1) {
  items = { modX: 20, modY: 60, plantX: 5, plantY: 6 }
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
    return '#D68D5E';
  }
  else {
    return '#189968';
  }
}

// selected plant
let selected = null; // A global variable that starts as null

// Use it in a function
function selectItem(scientificName) {
  if (selected === scientificName) {
    selected = null;
  }
  else {
    selected = scientificName;

  }
}
function fetchPlant(scientificName) {
  var plants = JSON.parse(article.dataset.plants);
  return plants.find(
    function (plants) { return plants.scientificName == scientificName }
  );
}

// populates plant info to the right side of the page
function showPlantInfo(scientificName) {
  let infoPlant = document.getElementById('infoPlant');
  let infoText = document.getElementById('infoText');
  let infoImage = document.getElementById('infoImage');
  if (selected !== scientificName) {
    selected = scientificName;
    let plant = fetchPlant(scientificName)
    console.log(plant)
    // selectItem(data['scientificName']);
    let commonName = plant.commonName || ''
    let familyCommonName = plant.familyCommonName || ''
    let family = `plant.family - plant.familyCommonName`
    let genus =  plant.genus
    let synonyms = `Synonyms: ${plant.synonyms}`
    // let plantInfoHtml = `<strong>Family:</strong> ${plant.family} (${plant.familyCommonName})<br><strong>Genus:</strong> ${plant.genus}<br><strong>Synonyms:</strong> ${plant.synonyms}`
    let plantInfoHtml = `${commonName} <br><strong>Family:</strong> ${plant.family} <br><strong>Genus:</strong> ${plant.genus}`
    infoPlant.innerHTML = `${plant.scientificName}` ;
    infoText.innerHTML = plant.commonName || plant.common_name;
    infoText.innerHTML = plantInfoHtml
    infoImage.src = plant.botanicPhoto || plant.image_url;
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
  str = str.replace(/ .*/, '')
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
  // .addTo('#sectionMap')
  // .size(400, 3800)
  shape = draw.rect(5, 6).attr({
    fill: pickColor(scientificName),
    opacity: 1,
    x: (modY * 20) + (15 - (plantY * 5)),
    y: (modX * 60) + (plantX * 6)
  })
  shape.data('key', { 'scientificName': individualPlant['plant']['scientificName'], 'commonName': individualPlant['plant']['commonName'], 'x': plantX, 'y': plantY, 'modX': modX, 'modY': modY, 'botanicPhoto': individualPlant['plant']['botanicPhoto'] })
  shape.mouseenter(function () {
    this.stroke({
      opacity: 1,
      width: 1,
      color: '#5ECCA2'
    })
    this.front();
    let data = this.data('key');
    showPlantInfo(data['scientificName']);
  })
  shape.mouseout(function () {
    if (selected === null || selected !== this.data('key')['scientificName']) {
      this.stroke({ opacity: 0.00, width: 2, color: '#ffffff' });
      // infoBox.innerText = data;
    }
  })
  shape.click(function () {
    draw.children().forEach(function (x) {
      let xData = x.data('key');  // Declare xData with 'let' or 'const'
      if (xData && xData['scientificName'] && xData['scientificName'] === this.data('key')['scientificName']) {
        selectItem(this.data('key')['scientificName']);
        x.stroke({ opacity: 1, width: 2, color: 'red' });
        x.front();
      } else {
        if (xData && xData['scientificName']) {
          x.stroke({ opacity: 0.00, width: 2, color: '#ffffff' });
        }
      }
    }.bind(this));
  });


}

function drawPlants(draw) {
  var article = document.querySelector('#sectionMap');
  // var allMods = JSON.parse(article.dataset.mods);
  var allPlants = JSON.parse(article.dataset.plantedplants);
  console.log('allPlants: ', allPlants);
  for (var i = 0; i < allPlants.length; i++) {
    individualPlantMap(draw, allPlants[i]);
  }
};

function sectionMap(draw) {
  var article = document.querySelector('#sectionMap');
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
      var x = n
      var y = i

      const mod = getMod(allMods, x, i)
      if (mod) {
        var defaultColor = findColor(mod['model'])
        var op = 0.01
        var id = mod['_id']

        if (mod['shape'] === 'R3' || mod['shape'] === "R2.3") {
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
          const { flipped } = mod;
          const topLeft = `${i * 20},${n * 60}`;
          const topRight = `${(i + 1) * 20},${n * 60}`;
          const bottomLeft = `${(i) * 20},${(n + 1) * 60}`;
          const bottomRight = `${(i + 1) * 20},${(n + 1) * 60}`;

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

      shape.dblclick(function () {
        // document.getElementById("x").value = this.data('key')["x"];
        // document.getElementById("y").value = this.data('key')["y"];
        modpage = 'module/' + this.data('key')["x"] + '&' + this.data('key')["y"];
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
  // draw = SVG().addTo('#sectionMap').size(400, 3800)
  const draw = SVG().addTo('#sectionMap').size(800, 3800)
  let zoomLevel = 1;
  const zoomStep = 0.2; // Change this to make the zoom in/out more or less aggressive

  // Get the SVG.js draw object's width and height
  const initialWidth = draw.width();
  const initialHeight = draw.height();

  document.querySelector('#zoomIn').addEventListener('click', function () {
    zoomLevel -= zoomStep;
    draw.viewbox(0, 0, initialWidth * zoomLevel, initialHeight * zoomLevel);
  });

  document.querySelector('#zoomOut').addEventListener('click', function () {
    zoomLevel += zoomStep;
    draw.viewbox(0, 0, initialWidth * zoomLevel, initialHeight * zoomLevel);
  });



  sectionMap(draw);
  drawPlants(draw);


  function selectPlant(scientificName) {
    if (selected === scientificName) {
      selected = null;
    }
    else {
      showPlantInfo(scientificName)
      draw.children().forEach(function (c) {
        let xData = c.data('key');  // Declare xData with 'let' or 'const'
        if (xData && xData['scientificName'] && c.data('key')['scientificName'] === scientificName) {
          c.stroke({ opacity: 1, width: 2, color: 'red' });
          c.front();
        }
        else {
          if (xData && xData['scientificName']) {
            c.stroke({ opacity: 0.0, color: '#D68D5E' });
            // c.fill({ color: pickColor(c.data('key')['scientificName']) });
          }
        }
      });
    };
  };

  window.selectPlant = selectPlant;
};