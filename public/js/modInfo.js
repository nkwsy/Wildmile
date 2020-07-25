// Modinfo.js

const $table = $('#table');
const $button = $('#button');

style.
  #toolbar {
  margin: 0;
  }
function ajaxGet(){
  $.ajax({
    type : "GET",
    url : "api/getInfo",
    async: false,
    success: function(data){

      console.log("Success: ", data.plantedPlants);
      items = data
      return items.plantedPlants
    },
  error : function(e) {
    console.log("ERROR: ", e);
  }
  });
  return items.plantedPlants
}

function ajaxRefresh(params = '') {
  $.ajax({
    type : "GET",
    url : "api/getInfo",
    async: false,
    ajaxSuccess: function(data){
      console.log("Success: ", data.plantedPlants);
      items = data
      return items.plantedPlants;
    },
  error : function(e) {
    console.log("ERROR: ", e);
  }
});
  return items.plantedPlants;

}

var $ok = $('#ok')

$(function() {
  $ok.click(function () {
    $table.bootstrapTable('refresh')
  })
})

function queryParams() {
  var params = {}
  $('#toolbar').find('input[name]').each(function () {
    if ($(this).val()) {
      params[$(this).attr('name')] = $(this).val()
    }
  })
  return params
}

function responseHandler(res) {
  return res.rows
}

$(function() {
   $('#toolbar').find('select').change(function () {
     $table.bootstrapTable('destroy').bootstrapTable({
       exportDataType: $(this).val(),
       exportTypes: ['json', 'xml', 'csv', 'txt', 'sql', 'excel', 'pdf'],
     })
   }).trigger('change')
 })
