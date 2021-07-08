$(document).ready(() => {


// Gets the count of items from each cell
  function getCount() {
    itemCounts = {}
    const table = document.getElementById('individualTrashItems');
    const rows = JSON.parse(table.getAttribute('data-individualItems'));
    // let rows = table.dataset.individualItems;
    rows.forEach((i) => {
      console.log(i.itemId)
      if(itemCounts.hasOwnProperty(i.itemId)) {
        itemCounts[i.itemId]++
      } else {
        itemCounts[i.itemId] = 1;
      }
    });
    return itemCounts;
    };

//Formats and sends the count of each item to the cell
function setDefaultItemValue(itemCount) {
    Object.keys(itemCount).forEach((key) => {
    var numberOfItems = itemCount[key];
    document.getElementsByClassName(key)[0].value = numberOfItems;
    console.log(document.getElementsByClassName(key));

});
  }

setDefaultItemValue(getCount());
  var currentLocation = window.location.pathname;
  console.log(getCount());
  // Live form updating
  let formData = {
    data: $('form').serialize()
  };

  //
  // event.preventDefault();
  // $('#quantity').prop('disabled', true);
  // $('#plus-btn').click(function(){
  //   $('#quantity').val(parseInt($('#quantity').val()) + 1 );
  //       });
  // $('#minus-btn').click(function(){
  //   $('#quantity').val(parseInt($('#quantity').val()) - 1 );
  //   if ($('#quantity').val() == -1) {
  //   $('#quantity').val(0);
  // }
  //
  //       });


  // AJAX updates the DB with post
  $("#newTrashLog").on("input", function(){
      // Print entered value in a div box
      let formData = $('form').serializeArray()
      $.ajax({
        type: "POST",
        url: $("form").attr("action"),
        data:  $("form").serialize(),
      }).done(function (data) {
        console.log(data);
      });
        // Print entered value in a div box
        console.log(formData);
  });

});
