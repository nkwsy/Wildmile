"use client";

export function toggleCellOn(plantCell) {
  const cell = plantCell.konva_object;
  cell.strokeWidth(1);
  cell.opacity(1);
}
export function toggleCellOff(plantCell) {
  const cell = plantCell.konva_object;
  cell.strokeWidth(0.1);
  cell.opacity(0.2);
  // TODO make cell fill null
  //   cell.fill(null);
}

export function toggleCellFill(plantCell, color) {
  const cell = plantCell.konva_object;
  cell.fill(color);
}
