
// Default export is a4 paper, portrait, using millimeters for units
const { jsPDF } = require("jspdf"); // will automatically load the node version

$(document).ready(() => {
  const doc = new jsPDF();

console.log('pdf');
doc.text("Hello world!", 10, 10);
doc.save("a4.pdf");
});
