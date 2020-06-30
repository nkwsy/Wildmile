function checkPlants(modId, x, y) {
  let article = document.querySelector('#modMap');
  console.log(article.dataset);
  let data = JSON.parse(article.dataset.plantedplants)
  let len = data.length;
  for (i = 0; i < len; i++) {
    if (data[i] && data[i].hasOwnProperty("module")) {
      if (data[i]["module"] == modId) {
        if (data[i]["y"] == y && data[i]["x"] == x) {
          //console.log(data[i]["y"]);
          return data[i]
        }
      }
    }
  }

  return false;
}
function drawMod(shape, modId) {
  let draw = SVG().addTo('#circle_1').size(900, 300)
  console.log(shape);
  if (shape == 'Rtriangle') {
    let triangle = draw.polygon('0,0 900,1300 900,0').fill('green').stroke({
      width: 1
    })
  }
  if (shape == 'Ltriangle') {
    let triangle = draw.polygon('0,0 900,300 900,0').fill('green').stroke({
      width: 1
    })
  }
  if (shape == 'rectangle') {
    let rect = draw.rect(900, 300).attr({
      fill: '#A9E079'
    });
  }
  // var rect = draw.rect(900, 300).attr({ fill: 'green' })
  // var triangle = draw.polygon('0,0 900,300 300,0').fill('green').stroke({ width: 1 })
  //

  var fillcolor = ['yellow', 'red', 'blue']
  var fillcolor = ['#7FD674', '#A9E079', '#BAC977', '#E0DB79', '#D6C874']
  pselect = [];

  for (let n = 0; n < 10; n++) {
    for (let i = 0; i < 4; i++) {
      // array[i]
      // let plant = checkPlants(modId, n, i)
      // console.log(plant);
      // var circle = draw.circle(40, 40).attr({ fill: 'grey' , opacity: 0.3, cy: i*75 + 30, cx: n*90+30}).data('key', {n,i})
      circle = draw.circle(40, 40).attr({
          fill: 'grey',
        opacity: 1,
          cy: i * 75 + 30,
          cx: n * 90 + 30
        }).data('key', {
          x,
          y
        })
      //var circle = circleColor(n,i);
      //console.log(i, circle.node);
      circle.click(function () {
        this.fill({
          color,
        })
        var a = this.data('key')
        plantMatrix.push({
          color,
          location: a
        });
        //plantMatrix.push([color, a]);
        console.log(color, this.data('key'));
        console.log(JSON.stringify(plantMatrix));
        document.getElementById("individualPlants").value = JSON.stringify(plantMatrix);


      })
    }
  }
}

$(document).ready(() => {
  var article = document.querySelector('#plants');
  console.log(article);
  drawMod('rectangle', 'etuhc4545');
});
