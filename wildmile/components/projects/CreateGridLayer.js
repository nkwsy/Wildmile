"use client";
import React, { useContext, useEffect } from "react";
import { Line } from "react-konva";
import { CanvasContext } from "./context_mod_map";

const CreateGridLayer = () => {
  const { cellWidth, cellHeight, rows, cols, modRef } =
    useContext(CanvasContext);

  useEffect(() => {
    const layer = modRef.current; // Assuming modRef is a reference to the Konva Layer
    if (!layer) {
      return;
    }

    // Clear the previous grid
    layer.find(".grid-line").forEach((line) => line.destroy());

    // Draw the new grid
    for (let i = 0; i <= rows; i++) {
      const line = new Line({
        points: [0, i * cellHeight, cols * cellWidth, i * cellHeight],
        stroke: "grey",
        strokeWidth: 1,
        listening: false, // Optimization: non-interactive
        name: "grid-line", // For easy clean-up
      });
      layer.add(line);
    }

    for (let j = 0; j <= cols; j++) {
      const line = new Line({
        points: [j * cellWidth, 0, j * cellWidth, rows * cellHeight],
        stroke: "grey",
        strokeWidth: 1,
        listening: false, // Optimization: non-interactive
        name: "grid-line", // For easy clean-up
      });
      layer.add(line);
    }

    // Redraw the layer to display the grid
    layer.batchDraw(); // Use batchDraw for performance optimization

    // Cleanup function to remove all grid lines when the component unmounts or before re-running the effect
    return () => layer.find(".grid-line").forEach((line) => line.destroy());
  }, [cellWidth, cellHeight, rows, cols, modRef]); // Dependency array to control re-rendering

  return null; // This component does not render anything itself
};

export default CreateGridLayer;
