"use client";
import { CellGen } from "./mod_util";
import React, { useContext, useEffect, useMemo } from "react";
import { CanvasContext } from "./context_mod_map";

export function CreateModuleLayer(props) {
  const {
    cellWidth,
    triggerUpdate,
    cellHeight,
    rows,
    cols,
    modRef,
    modules,
    toggleCellSelection,
  } = useContext(CanvasContext);

  console.log(
    "CreateRectLayer:",
    cellWidth,
    cellHeight,
    rows,
    cols,
    modRef
    // modules
  );
  // useMemo to calculate groups based on dependencies
  const groups = useMemo(() => {
    const newGroups = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        let cellShape = CellGen({
          x: rowIndex,
          y: colIndex,
          cellWidth,
          cellHeight,
          modules,
          toggleCellSelection,
        });
        newGroups.push(cellShape);
      }
    }
    return newGroups;
  }, [modules]); // Include modules in the dependency array
  // rows, cols, cellWidth, cellHeight,
  // useEffect to handle side effects, like updating the canvas
  useEffect(() => {
    const layer = modRef.current;
    if (!layer) {
      return;
    }

    // Clear existing content
    // layer.clear();

    // Add new groups to the layer
    groups.forEach((group) => {
      layer.add(group);
      // setCells((prevCells) => {
      //   const newCells = new Map(prevCells);
      //   const key = `${group.x},${group.y}`;
      //   newCells.set(key, group);
      // });
    });

    // layer.add(cells);
    // Redraw the layer to display the new content
    // layer.draw();

    // Cleanup function to remove all groups when the component unmounts or before re-running the effect
    return () => {
      groups.forEach((group) => {
        group.remove();
      });
    };
  }, [groups, modRef]); // Effect depends on groups and modRef

  return null;
}
