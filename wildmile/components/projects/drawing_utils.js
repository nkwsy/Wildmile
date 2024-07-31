"use client";

// default color for plant cells
const defaultStroke = "white";
const defaultStrokeWidth = 0.2;
const defaultOpacity = 0.2;

import { useClientState } from "./context_mod_map";

export function formatScientificName(scientificName) {
  const words = scientificName.split(" ");
  let formattedName = `${words[0].charAt(0)}.`;
  if (words.length > 1) {
    formattedName += `\n${words[1].substring(0, 6)}`;
  }
  return formattedName;
}

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
  // cell.fill(null);
}

export function toggleCellFill(plantCell, color, opacity) {
  const cell = plantCell.konva_object;
  cell.fill(color);
}
export function setCellBlank(plantCell) {
  // Check if the cell contains a plant
  if (!plantCell.plant_id) {
    // setCellPlantFill(plantCell, plantCell.plant_id);

    const cell = plantCell.konva_object;
    const group = plantCell.konva_group;
    cell.fill(null);
    cell.stroke(defaultStroke);
    cell.strokeWidth(defaultStrokeWidth);
    cell.opacity(defaultOpacity);
    group.destroyChildren();
  }
}
export function setCellPlantFill(plantCell, plantData) {
  const cell = plantCell.konva_object;
  // TODO: Option to display thumbnail of plant
  // const plantData = plantData.id;
  // if (plantData.thumbnail) {
  //   var imageObj = new Image();
  //   imageObj.src = plantData.thumbnail;
  //   cell.fillPatternImage(imageObj);
  //   cell.fillPatternScale({ x: 0.02, y: 0.02 });
  //   if (plantData.color && plantData.color.family) {
  //     cell.fill(plantData.color.family);
  //     cell.opacity(0.1);
  //   }
  //TODO: make the cell a layer in mod_util.js so text can be added
  var text = new Konva.Text({
    // x: cell.x() + 0.2,
    // y: cell.y() + 0.2,
    x: 0.4,
    y: 0.4,
    fontSize: 2,
    // fontFamily: "Courier New",
    // fontStyle: "monospace",
    fontVariant: "small-caps",
    fill: "white",
    listening: false,
  });

  if (plantData.color && plantData.color.main) {
    text.stroke(plantData.color.main);
    text.fillAfterStrokeEnabled(true);
    text.strokeWidth(1);
  }
  // format name into short version
  const formattedName = formatScientificName(plantData.scientific_name);
  text.text(formattedName);
  text.name("plantText");
  const cellLayer = cell.getLayer();
  const cellGroup = plantCell.konva_group;
  // cellLayer.add(text);

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
  cellGroup.destroyChildren();
  cellGroup.add(text);
}

export function setCellOnStroke(plantCell, color) {
  const cell = plantCell.konva_object;
  cell.stroke(color);
  cell.strokeWidth(1);
  cell.opacity(1);
}
