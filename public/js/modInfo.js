// Modinfo.js

const $table = $('#table');
const $button = $('#button');

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
