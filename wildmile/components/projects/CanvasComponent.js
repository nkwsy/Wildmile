"use client";
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import {
  Stage,
  Layer,
  Rect,
  Text,
  Group,
  Line,
  useStrictMode,
} from "react-konva";

import { useClient } from "./context_mod_map";

const CanvasComponent = ({ children }) => {
  const clientValues = useClient();
  const {
    cellWidth,
    cellHeight,
    rows,
    cols,
    modRef,
    plantRef,
    gridRef,
    containerSize,
    scale,
    rotation,
    handleWheel,
  } = clientValues;

  // State to trigger re-renders
  const [isReady, setIsReady] = useState(false);

  // Function to check if all required values are valid
  const areValuesValid = () => {
    // Add any additional checks as necessary
    return (
      cellWidth !== undefined &&
      cellHeight !== undefined &&
      rows !== undefined &&
      cols !== undefined &&
      modRef?.current &&
      plantRef?.current &&
      gridRef?.current &&
      containerSize &&
      containerSize.width !== undefined &&
      containerSize.height !== undefined &&
      scale !== undefined &&
      rotation !== undefined &&
      typeof handleWheel === "function"
    );
  };

  useEffect(() => {
    // Check if all values are valid and update the state accordingly
    setIsReady(areValuesValid());
  }, [clientValues]); // Depend on the entire clientValues object

  // Early return if not all values are valid
  if (!isReady) {
    return <div>Loading...</div>; // Or return null if you don't want to render anything
  }

  // Render your component if all values are valid
  return (
    <>
      <Stage
        ref={gridRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={scale}
        scaleY={scale}
        onWheel={handleWheel}
        rotation={rotation}
        draggable
      >
        <Layer ref={plantRef}></Layer>
        <Layer ref={modRef}></Layer>
        {children}
      </Stage>
    </>
  );
};
export default CanvasComponent;
