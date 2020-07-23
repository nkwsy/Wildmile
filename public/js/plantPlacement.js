
const selectors = [];
let plantMatrix = [];
const uniquePlants = [];
let data = {};
let selectedColor;
let selectionNumber;

const article = document.querySelector('#circle_1');

try {
  data = JSON.parse(article.dataset.plantedplants);
} catch (e) {
}
const len = data.length;

function defineUniquePlants() {
  $.each(data, (index, value) => {
    if ($.inArray(value.plant, uniquePlants) === -1) {
      uniquePlants.push(value.plant);
    }
  });
}

function updateSelector(selectorName, plantId) {
  $(selectorName).val(plantId);
}
function checkPlants(x, y) {
  for (let k = 0; k < len; k++) {
    if (data[k]) {
      if (data[k].y == y && data[k].x == x) {
        val = data[k].plant;
        console.log(selectors);
        a = uniquePlants.indexOf(data[k].plant.toString());
        // uniquePlants[a]='used';
        a += 1;
        console.log('ddd', uniquePlants, a);
        const sss = '#plant';
        updateSelector(sss + a, data[k].plant);
        return a;
      }
    }
  }
  return false;
}

function drawMod(shape) {
  const moduleColor = '#7FD674';
  const article = document.querySelector('#circle_1');
  //  let data = JSON.parse(article.dataset.plantedPlants)
  console.log(article.dataset.plantedplants);
  const draw = SVG().addTo('#circle_1').size(900, 300);
  console.log(shape);
  if (shape == 'Rtriangle') {
    var triangle = draw.polygon('0,0 900,1300 900,0').fill(moduleColor).stroke({
      width: 1
    });
  }
  if (shape == 'Ltriangle') {
    var triangle = draw.polygon('0,0 900,300 900,0').fill(moduleColor).stroke({
      width: 1
    });
  }
  if (shape == 'rectangle') {
    const rect = draw.rect(900, 300).attr({
      fill: moduleColor
    });
  }

  var fillcolor = ['yellow', 'red', 'blue'];
  var fillcolor = ['#7FD674', '#A9E079', '#BAC977', '#E0DB79', '#D6C874'];
  let pselect = [];
  for (let n = 0; n < 10; n++) {
    for (let i = 0; i < 4; i++) {
      SelectorNum = checkPlants(n, i);
      var circle = draw.circle(40, 40).attr({
        fill: 'grey', opacity: 0.3, cy: i * 75 + 30, cx: n * 90 + 30
      }).data('key', { n, i });
      if (SelectorNum) {
        // if (pselect.length < 1) {
        var circle = draw.circle(40, 40).attr({
          fill: selectors[SelectorNum].color,
          opacity: 0.9,
          cy: i * 75 + 30,
          cx: n * 90 + 30
        }).data('key', {
          x: n,
          y: i
        });
        plantMatrix.push({
          selection: SelectorNum,
          location: {x: n, y: i}
        });
      } else {
        var circle = draw.circle(40, 40).attr({
          fill: 'grey',
          opacity: 1,
          cy: i * 75 + 30,
          cx: n * 90 + 30
        }).data('key', {
          x: n,
          y: i
        });
      }
      document.getElementById('individualPlants').value = JSON.stringify(plantMatrix);
      circle.click(function (e) {
        if (!selectedColor) {
          return;
        }

        const clickedLocation = this.data('key');
        const existingSelectionIndex = plantMatrix.findIndex(plant => plant.location.x === clickedLocation.x && plant.location.y === clickedLocation.y);
        const existingSelection = plantMatrix[existingSelectionIndex];

        console.log('existingSelection: ', existingSelection);

        if (e.metaKey) {
          plantMatrix = plantMatrix.filter(plant => !(plant.location.x === clickedLocation.x && plant.location.y === clickedLocation.y));
          this.fill({
            color: 'grey',
            opacity: 1
          });
        } else if (!existingSelection) {
          plantMatrix.push({
            selection: selectionNumber,
            location: clickedLocation
          });

          this.fill({
            color: selectedColor,
            opacity: 1
          });
        } else if (existingSelection.selection !== selectionNumber) {
          plantMatrix[existingSelectionIndex] = {
            selection: selectionNumber,
            location: clickedLocation
          };

          this.fill({
            color: selectedColor,
            opacity: 1
          });
        } else {
          plantMatrix.splice(existingSelectionIndex, 1);
          this.fill({
            color: 'grey',
            opacity: 1
          });
        }

        document.getElementById('individualPlants').value = JSON.stringify(plantMatrix);

        console.log(selectedColor, this.data('key'));
        console.log(JSON.stringify(plantMatrix));
      });
    }
  }
}


function makeSelector(index, selectorColor) {
  const draw = SVG().addTo(`#selector${index}`).size(40, 80);
  const circle = draw.circle(40, 40).attr({
    fill: selectorColor,
    cx: 20,
    cy: 20
  });
  circle.on('click', () => {
    clearSelected();
    select(selectors[index]);
  });

  selectors[index] = {
    circle,
    color: selectorColor,
    selected: false,
    selectionNumber: index,
  };

  function select(s) {
    s.selected = true;
    s.circle.stroke({
      color: 'black',
      opacity: 0.6,
      width: 2,
    });

    selectedColor = s.color;
    selectionNumber = s.selectionNumber;
  }

  function clearSelected() {
    selectors.forEach((s) => {
      s.selected = false;
      s.circle.stroke({
        width: 0,
      });
    });
  }
}


function clicker(ss, sel) {
  ss.stroke({
    color: 'black',
    opacity: 0.6,
    width: 2
  });
  selectedColor = ss.attr('fill');
}


$(document).ready(() => {
  makeSelector(1, 'orange');
  makeSelector(2, 'red');
  makeSelector(3, 'yellow');
  makeSelector(4, 'green');
  makeSelector(5, 'blue');
  defineUniquePlants();
  drawMod('rectangle');
  console.log(uniquePlants);
  function individualPlants() {
    document.getElementById('individualPlants').value = plantMatrix;
    console.log(plantMatrix, 'pm');
    return plantMatrix;
  }
});
