"use client";

// default color for plant cells
const defaultStroke = "white";
const defaultStrokeWidth = 0.2;
const defaultOpacity = 0.2;

import { useClientState } from "./context_mod_map";

// export const { plantInfo } = useClientState("plants");
export function getIndexColor(indexNumber) {
  const default_swatches = [
    "#fa5252",
    "#be4bdb",
    "#7950f2",
    "#228be6",
    "#15aabf",
    "#12b886",
    "#40c057",
    "#fab005",
    "#fd7e14",
    "#2e2e2e",
    "#868e96",
  ];
  return default_swatches[indexNumber];
}

export function toggleCellOn(plantCell) {
  // Your code here
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
  // const plantData = plantData.id;

  if (plantData.color) {
    if (plantData.color.family) {
      cell.fill(plantData.color.family);
      cell.opacity(1);
    } else {
      cell.fill("#099CFF");
      cell.opacity(0.9);
    }
  } else {
    cell.fill("#099CFF");
    cell.opacity(0.9);
  }
}

export function setCellOnStroke(plantCell, color) {
  const cell = plantCell.konva_object;
  cell.stroke(color);
  cell.strokeWidth(1);
  cell.opacity(1);
}
