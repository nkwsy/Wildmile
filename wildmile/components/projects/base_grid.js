import React, { useRef, useEffect } from "react";
import { Stage, Layer, Line, Rect } from "react-konva";

export const GridLayer = ({ width, height, cellSize }) => {
  const gridLines = [];

  // Generate vertical lines
  for (let i = 0; i < width / cellSize; i++) {
    gridLines.push(
      <Line
        key={`v-${i}`}
        points={[i * cellSize, 0, i * cellSize, height]}
        stroke="#e0e0e0"
      />
    );
  }

  // Generate horizontal lines
  for (let j = 0; j < height / cellSize; j++) {
    gridLines.push(
      <Line
        key={`h-${j}`}
        points={[0, j * cellSize, width, j * cellSize]}
        stroke="#e0e0e0"
      />
    );
  }

  return <Layer>{gridLines}</Layer>;
};

export const BaseGrid = ({ layers, addLayer }) => {
  const stageRef = useRef(null);

  useEffect(() => {
    layers.forEach((layer) => {
      addLayer(stageRef.current, layer);
    });
  }, [layers, addLayer]);

  return (
    <Stage width={window.innerWidth} height={window.innerHeight} ref={stageRef}>
      <GridLayer
        width={window.innerWidth}
        height={window.innerHeight}
        cellSize={50}
      />
      {/* Additional layers can be added here or dynamically */}
      {layers.map((layer, index) => (
        <Layer key={index}>{layer}</Layer>
      ))}
    </Stage>
  );
};

export const createRectLayer = ({ x, y }) => {
  const rect = new Rect({
    x: x * 50, // Multiply by cellSize to get the actual position
    y: y * 50,
    width: 100,
    height: 50,
    fill: "red",
    draggable: true,
  });

  return rect;
};
