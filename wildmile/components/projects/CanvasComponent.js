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

import dynamic from "next/dynamic";

const CellGen = dynamic(() => import("./mod_util"), {
  ssr: false,
});
const createRectLayer = dynamic(() => import("./CreateRectLayer"), {
  ssr: false,
});

import { useClient } from "./context_mod_map";
import { CreateRectLayer } from "./canvas_base";

const CanvasComponent = ({ children }) => {
  useStrictMode(true);
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
    plantsVisible,
    modsVisible,
    layers,
  } = clientValues;
  console.log("CanvasComponent: ", clientValues);
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
      //   modRef?.current &&
      //   plantRef?.current &&
      //   gridRef?.current &&
      containerSize &&
      containerSize.width !== undefined &&
      containerSize.height !== undefined &&
      scale !== undefined &&
      rotation !== undefined &&
      layers !== undefined &&
      typeof handleWheel === "function"
    );
  };

  useEffect(() => {
    // Check if all values are valid and update the state accordingly
    setIsReady(areValuesValid());
    console.log("CanvasComponent isReady: ", isReady);
  }, [clientValues]); // Depend on the entire clientValues object

  // Early return if not all values are valid
  if (!isReady) {
    return <div>Loading...</div>; // Or return null if you don't want to render anything
  }
  console.log("layers", layers);
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
        {layers.map((layer) => (
          <Layer key={layer.id} ref={layer.ref} visible={layer.visible}></Layer>
        ))}

        {/* <Layer ref={plantRef} visible={plantsVisible} id={"plantCells"}></Layer> */}
        {/* <Layer ref={modRef} visible={modsVisible} id={"modCells"}></Layer> */}
        {/* <Layer ref={plantRef}></Layer>
        <Layer ref={modRef}></Layer> */}
        {children}
        <CreateRectLayer />
      </Stage>
    </>
  );
};
export default CanvasComponent;
