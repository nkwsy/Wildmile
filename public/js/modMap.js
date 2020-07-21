///Modmap.js

let article = document.querySelector('#modMap');
console.log(article.dataset);
let data = JSON.parse(article.dataset.mods)

function checkIfModExists(data, x, y) {
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

function modMap() {
  var draw = SVG().addTo('#modMap').size(400, 3800)
  var article = document.querySelector('#modMap');
  console.log(article.dataset);
  var allMods = JSON.parse(article.dataset.mods);
  var defaultColor = 'grey'
  console.log('allMods: ', allMods);

  //var rect = draw.rect(60, 20).attr({ fill: '#189968' }).stroke({ color: '#5ECCA2',  width: 2 })
  var wide = 30;
  for (var n = 0; n < 30; n++) {
    for (var i = 0; i < 10; i++) {
      let rect;
      color = '#189968'
      var x = 200 - n
      var y = i

      t = checkIfModExists(allMods, x, i)

      if (t) {
        var defaultColor = color
        var op = 1
        var id = t['_id']

        if (t['shape'] === 'R3') {
          rect = draw.rect(20, 60).attr({
            fill: defaultColor,
            opacity: op,
            x: i * 20,
            y: n * 60
          }).data('key', {
            x,
            y
          }).stroke({
            color: '#5ECCA2',
            width: 1
          })
        }
        if (t['shape'] === 'T3') {
          const topLeft = `${i*20},${n * 60}`;
          const topRight = `${(i+1)*20},${n * 60}`;
          const bottomLeft = `${(i)*20},${(n+1) * 60}`;
          const bottomRight = `${(i+1)*20},${(n+1) * 60}`;

          if (t['orientation'] === 'RH') {
            rect = draw.polygon(`${topLeft} ${topRight} ${bottomLeft}`).attr({
              fill: defaultColor,
              opacity: op,
              x: i * 20,
              y: n * 60
            }).data('key', {
              x,
              y
            }).stroke({
              color: '#5ECCA2',
              width: 1
            })
          } else if (t['orientation'] === 'LH') {
            rect = draw.polygon(`${topLeft} ${bottomLeft} ${bottomRight}`).attr({
              fill: defaultColor,
              opacity: op,
              x: i * 20,
              y: n * 60
            }).data('key', {
              x,
              y
            }).stroke({
              color: '#5ECCA2',
              width: 1
            })
          }
        }
      } else {
        defaultColor = 'white'
        op = 1
        rect = draw.rect(20, 60).attr({
          fill: defaultColor,
          opacity: op,
          x: i * 20,
          y: n * 60
        }).data('key', {
          x,
          y
        }).stroke({
          color: '#5ECCA2',
          width: 1
        })
      }

      var g = i * 20
      var h = n * 60

      rect.click(function () {
        document.getElementById("x").value = this.data('key')["x"];
        document.getElementById("y").value = this.data('key')["y"];
        modpage = 'module/'+this.data('key')["x"]+'&'+this.data('key')["y"];
        window.location.href = modpage;
        drawMod(t["shape"], t["id"])
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

};

window.onload = function () {
  modMap();
};
