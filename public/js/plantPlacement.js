
let selectors = [];
let plantMatrix = [];
let uniquePlants = [];
let data = {};
let selectedColor, selectionNumber;

let article = document.querySelector('#circle_1');

try {
  data = JSON.parse(article.dataset.plantedplants);
}
catch(e) {
}
let len = data.length;

function defineUniquePlants() {
  $.each(data, (index, value) => {
      if ($.inArray(value.plant, uniquePlants) === -1) {
          uniquePlants.push(value.plant);
      }
  });
}

function updateSelector(selectorName,plantId) {
  $(selectorName).val(plantId);
}
function checkPlants(x, y) {
  for (var k = 0; k < len; k++) {
    if (data[k] ) {
        if (data[k].y == y && data[k].x == x) {
          val = data[k].plant;
          console.log(selectors);
          a = uniquePlants.indexOf(data[k].plant.toString());
          // uniquePlants[a]='used';
          a += 1;
          console.log('ddd',uniquePlants,a);
          var sss= '#plant';
          updateSelector(sss+a,data[k].plant);
        return a;
        }
      }
    }
    return false;
}

  function drawMod(shape) {
    let moduleColor = '#7FD674';
    let article = document.querySelector('#circle_1');
    //  let data = JSON.parse(article.dataset.plantedPlants)
      console.log(article.dataset.plantedplants);
    var draw = SVG().addTo('#circle_1').size(900, 300)
    console.log(shape);
    if (shape == 'Rtriangle') {
      var triangle = draw.polygon('0,0 900,1300 900,0').fill(moduleColor).stroke({
        width: 1
      })
    }
    if (shape == 'Ltriangle') {
      var triangle = draw.polygon('0,0 900,300 900,0').fill(moduleColor).stroke({
        width: 1
      })
    }
    if (shape == 'rectangle') {
      let rect = draw.rect(900, 300).attr({
        fill: moduleColor
      });
    }

    var fillcolor = ['yellow', 'red', 'blue']
    var fillcolor = ['#7FD674', '#A9E079', '#BAC977', '#E0DB79', '#D6C874'];
    pselect = [];
  for (var n = 0; n < 10; n++) {
    for (var i = 0; i < 4; i++) {
        console.log('ii',n,i);
        SelectorNum = checkPlants(n, i);
        var circle = draw.circle(40, 40).attr({ fill: 'grey' , opacity: 0.3, cy: i*75 + 30, cx: n*90+30}).data('key', {n,i})
        if (SelectorNum) {
          // if (pselect.length < 1) {
            var circle = draw.circle(40, 40).attr({
              fill: selectors[SelectorNum].color,
              opacity: 0.9,
              cy: i * 75 + 30,
              cx: n * 90 + 30
            }).data('key', {
              x,
              y
            })
            pselect.push(SelectorNum["plant"])
        } else {
      var circle = draw.circle(40, 40).attr({
            fill: 'grey',
            opacity: 1,
            cy: i * 75 + 30,
            cx: n * 90 + 30
          }).data('key', {
            x: n,
            y: i
          })
       }
        circle.click(function () {
          if (!selectedColor) {
            return;
          }

          this.fill({
            color: selectedColor,
            opacity: 1
          })
          var a = this.data('key')
          var b = this.data('selectionNumber')
          console.log(this.data());
          plantMatrix.push({
          selection: selectionNumber,
          location: a
          });
          //plantMatrix.push([color, a]);
          console.log(selectedColor, this.data('key'));
        console.log(JSON.stringify(plantMatrix));
        document.getElementById("individualPlants").value = JSON.stringify(plantMatrix);
        })
      }
    }
  }


  function makeSelector(index, selectorColor) {
    var draw = SVG().addTo(`#selector${index}`).size(40, 80)
    var circle = draw.circle(40, 40).attr({
      fill: selectorColor,
      cx: 20,
      cy: 20
    })
    circle.on('click', function () {
      clearSelected()
      select(selectors[index])
    });

    selectors[index] = {
      circle,
      color: selectorColor,
      selected: false,
      selectionNumber: index,
    }

    function select(s) {
      s.selected = true
      s.circle.stroke({
        color: 'black',
        opacity: 0.6,
        width: 2,
      })

      selectedColor = s.color
      selectionNumber = s.selectionNumber
    }

    function clearSelected() {
      selectors.forEach(s => {
        s.selected = false
        s.circle.stroke({
          width: 0,
        })
      });
    }
  }


  function clicker(ss, sel) {
    ss.stroke({
      color: 'black',
      opacity: 0.6,
      width: 2
    })
    selectedColor = ss.attr('fill')
  }


  $(document).ready(function() {
    makeSelector(1, 'orange');
    makeSelector(2, 'red');
    makeSelector(3, 'yellow');
    makeSelector(4, 'green');
    makeSelector(5, 'blue');
    defineUniquePlants();
    drawMod('rectangle');
    console.log(uniquePlants);
    function individualPlants() {
    document.getElementById("individualPlants").value = plantMatrix;
    console.log(plantMatrix, 'pm');
    return plantMatrix
}
});
