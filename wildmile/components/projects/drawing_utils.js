"use client";

// default color for plant cells
const defaultStroke = "white";
const defaultStrokeWidth = 0.2;
const defaultOpacity = 0.2;

export function toggleCellOn(plantCell) {
  const cell = plantCell.konva_object;

  cell.strokeWidth(1);
  cell.opacity(1);
}
export function toggleCellOff(plantCell) {
  const cell = plantCell.konva_object;
  // TODO - set to default for real plant colors
  cell.stroke(defaultStroke);
  cell.strokeWidth(0.1);
  // cell.pacity(0.2);
  // TODO make cell fill null
  //   cell.fill(null);
}

export function toggleCellFill(plantCell, color) {
  const cell = plantCell.konva_object;
  cell.fill(color);
}
export function setCellPlantFill(plantCell, plantData) {
  const cell = plantCell.konva_object;
  if (plantData.color) {
    if (plantData.color.family) {
      cell.fill(plantData.color.family);
      cell.opacity(1);
    }
  }
}

export function setCellOnStroke(plantCell, color) {
  const cell = plantCell.konva_object;
  cell.stroke(color);
  cell.strokeWidth(1);
  cell.opacity(1);
}
