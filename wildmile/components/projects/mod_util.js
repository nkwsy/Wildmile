"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Line,
  useStrictMode,
} from "react-konva";
import { Grid } from "@mantine/core";
import { Button } from "@mantine/core";
import useSWR from "swr";
import LocationModal from "components/maps/LocationModal";
import { ModuleFormModal } from "./module_form";
import { use } from "passport";
// import dynamic from "next/dynamic";

// const Canvas = dynamic(() => import("../components/canvas"), {
//   ssr: false,
// });
export const fetcher = (url) => fetch(url).then((res) => res.json());

// Choose correct module color
// Draw correct module
const TriangelePointsGen = ({
  orientation,
  flipped,
  cellWidth,
  cellHeight,
  x,
  y,
}) => {
  // Define points for a right triangle within the cell
  // Assuming the right angle is at the top left corner of the cell
  const topLeft = [x, y];
  const topRight = [x + cellWidth, y];
  const bottomLeft = [x, y + cellHeight];
  const bottomRight = [x + cellWidth, y + cellHeight];
  const points = [];
  if (orientation === "RH") {
    if (flipped) {
      points.push(
        topRight[0],
        topRight[1],
        bottomLeft[0],
        bottomLeft[1],
        bottomRight[0],
        bottomRight[1]
      );
    } else {
      points.push(
        topRight[0],
        topRight[1],
        bottomLeft[0],
        bottomLeft[1],
        topLeft[0],
        topLeft[1]
      );
    }
  } else if (orientation === "LH") {
    if (!flipped) {
      points.push(
        topLeft[0],
        topLeft[1],
        bottomRight[0],
        bottomRight[1],
        bottomLeft[0],
        bottomLeft[1]
      );
    } else {
      points.push(
        topLeft[0],
        topLeft[1],
        bottomRight[0],
        bottomRight[1],
        topRight[0],
        topRight[1]
      );
    }
  }
  return points;
};

// Check if a module is in an array, used for selectedModules
export function isXYInArray(array, x, y) {
  if (!Array.isArray(array)) {
    return false;
  }

  return array.some((item) => item.x === x && item.y === y);
}

// Find a module in an array
export function findItemInArray(array, x, y) {
  if (!Array.isArray(array)) {
    return null;
  }
  return array.find((item) => item.x === x && item.y === y) || false;
}

export const ModuleGen = (config) => {
  const {
    module,
    cellWidth,
    cellHeight,
    // setSelectedModule,
    // isSelected,
    // changeSelectedCell,
    // toggleCellSelection,
  } = config;

  // const changeModState = () => {
  //   setSelectedModule(module);
  //   toggleCellSelection(module.x, module.y);
  // };
  // const stroke = isSelected ? "#1080dc" : "#5ECCA2";
  // const strokeWidth = isSelected ? 4 : 0.1;
  // const color = module.model === "5-d" ? "#D68D5E" : "#189968";

  const stroke = "#5ECCA2";
  const strokeWidth = 0.1;
  const color = module.model === "5-d" ? "#D68D5E" : "#189968";

  if (module.shape === "R3" || module.shape === "R2.3") {
    // Create a rectangle shape
    const rect = new Konva.Rect({
      x: module.y * cellWidth,
      y: module.x * cellHeight,
      width: cellWidth,
      height: cellHeight,
      fill: color,
      stroke: stroke,
      strokeWidth: strokeWidth,
      // draggable: true,
      id: `${module.x},${module.y}`,
    });

    // Add click event listener
    // rect.on("click", changeModState);

    return rect;
  }

  if (module.shape === "T3" || module.shape === "T2.3") {
    const x = module.y * cellWidth;
    const y = module.x * cellHeight;

    const points = TriangelePointsGen({
      orientation: module.orientation,
      flipped: module.flipped,
      cellWidth,
      cellHeight,
      x,
      y,
    });

    // Create a line shape
    const line = new Konva.Line({
      points: points,
      closed: true,
      fill: color,
      stroke: stroke,
      strokeWidth: strokeWidth,
      id: `${module.x}-${module.y}`,
    });

    // Add click event listener
    // line.on("click", changeModState);

    return line;
  }
};
// Generate a cell for a module

// export const CellGen = ({
const CellGen = ({
  x,
  y,
  cellWidth,
  cellHeight,
  toggleCellSelection,
  selectedCell,
  modules,
  // setSelectedModule,
}) => {
  // const changeSelectedCell = () => {
  //   toggleCellSelection(x, y);
  //   // console.log(x, y, "selected", isCellSelected(x, y));
  // };
  const isCellSelected = (x, y) => {
    return selectedCell.has(`${x},${y}`);
  };
  // const [isSelected, setIsSelected] = useState(false);
  let isSelected = false;
  function toggleSelection(currentValue) {
    return !currentValue;
  }

  const isModule = findItemInArray(modules, x, y);
  // const isSelected = isCellSelected(x, y);
  // const stroke = isSelected ? "#1080dc" : "grey";
  // const strokeWidth = isSelected ? 2 : 0.1;
  const stroke = "grey";
  const strokeWidth = 0.2;

  // console.log("isModule:", isModule, x, y, isSelected, isCellSelected(x, y));
  let rect;
  if (isModule) {
    rect = ModuleGen({
      module: isModule,
      cellWidth,
      cellHeight,
      // setSelectedModule,
      // isSelected,
      // changeSelectedCell,
      toggleCellSelection,
    });
  } else {
    // Create a rectangle shape for the cell
    rect = new Konva.Rect({
      x: y * cellWidth,
      y: x * cellHeight,
      width: cellWidth,
      height: cellHeight,
      opacity: 0.5,
      stroke: stroke,
      strokeWidth: strokeWidth,
      id: `${x},${y}`,
    });
  }
  const changeSelectedCell = (e) => {
    // logs clicked Konva.Circle instance
    // toggleSelection(isSelected);
    toggleCellSelection(x, y, e.target);
    console.log("clicked cell", e.target, e.target.id());
  };
  // Add click event listener
  // if (rect) {
  rect.on("click", changeSelectedCell);
  return rect;
  // }
};

export class PlantCell {
  constructor(
    module_id,
    x,
    y,
    module_location_x,
    module_location_y,
    shape,
    shape_key,
    attrs,
    plant_id,
    individual_plant_id
  ) {
    this.module_id = module_id;
    this.location_key = `${module_location_x}-${module_location_y}-${x}-${y}`;
    this.x = x; // This could represent the module's own x position if different from module_location's x
    this.y = y; // This could represent the module's own y position if different from module_location's y

    this.module_location = {
      x: module_location_x,
      y: module_location_y,
    };
    this.konva_object = shape; // Assuming 'shape' is a Konva shape instance
    this.shape_key = shape_key; // Unique identifier for the shape
    this.attrs = attrs; // Additional attributes for the cell
    this.individual_plant_id =
      individual_plant_id !== undefined ? individual_plant_id : null;
    this.plant_id = plant_id !== undefined ? plant_id : null;
  }

  // You might want to add methods here to interact with the PlantCell
}

export const PlantCellGen = ({
  cellWidth,
  cellHeight,
  togglePlantCellSelection,
  modules,
  // setSelectedModule,
}) => {
  const rows = 10;
  const columns = 4;
  const plantCellWidth = cellWidth / columns;
  const plantCellHeight = cellHeight / rows;

  const stroke = "white";
  const strokeWidth = 0.2;
  const opacity = 0.2;
  const plantCells = [];
  for (module of modules) {
    // Code inside the for loop
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 10; j++) {
        let rect;
        const x = module.y * cellWidth + plantCellWidth * i;
        const y = module.x * cellHeight + plantCellHeight * j;
        // Create a rectangle shape for the cell
        rect = new Konva.Rect({
          x: x,
          y: y,
          width: plantCellWidth,
          height: plantCellHeight,
          opacity: opacity,
          stroke: stroke,
          strokeWidth: strokeWidth,
          // TODO: Add unique id for each cell, prob module.x * i or some global value
          // id: `${module.x},${y}`,
          // visible: false,
        });

        // Add click event listener
        // if (rect) {
        let plantCell = new PlantCell(
          module._id,
          j,
          i,
          module.x,
          module.y,
          rect, // Unsure if I should pass the exact konva object
          rect.id(),
          {}
        );
        const changeSelectedCell = (e) => {
          togglePlantCellSelection(x, y, e.target, plantCell);
          console.log("clicked cell", e.target, e.target.id(), plantCell);
        };
        rect.on("click", changeSelectedCell);
        plantCells.push(plantCell);
      }
    }
  }
  return plantCells;
};

export default CellGen;
