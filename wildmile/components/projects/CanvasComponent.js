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
import { PlantMap } from "./plant_map";

// Get the screen size

const CanvasComponent = ({ children }) => {
  // useEffect(() => {
  //   const handleResize = () => {
  //     setContainerSize({
  //       width: window.innerWidth,
  //       height: window.innerHeight,
  //     });
  //   };

  useStrictMode(true);
  // const clientValues = useClient();
  const {
    cellWidth,
    cellHeight,
    rows,
    cols,
    modRef,
    plantRef,
    // containerSize,
    gridRef,
    // scale,
    // rotation,
    // handleWheel,
    plantsVisible,
    modsVisible,
    layers,
  } = useClient();
  const clientValues = {
    cellWidth,
    cellHeight,
    rows,
    cols,
    modRef,
    plantRef,
    gridRef,
    plantsVisible,
    modsVisible,
    layers,
  };
  const [rotation, setRotation] = useState(0);
  // const [scale, setScale] = useState(1);
  // Set the container size, unknown if used
  const [containerSize, setContainerSize] = useState({
    width:
      typeof window !== "undefined" && window.innerWidth
        ? window.innerWidth
        : 1200,
    height:
      typeof window !== "undefined" && window.innerHeight
        ? window.innerHeight
        : 1200,
  });
  // Set the container size on change
  useEffect(() => {
    const handleResize = () => {
      setContainerSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };
    window.addEventListener("resize", handleResize);
    // Remove event listener on cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // State to trigger re-renders
  const [isReady, setIsReady] = useState(false);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.25;
    const stage = e.target.getStage();

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.scale({ x: newScale, y: newScale });

    // setScale(newScale);
  };

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
      // scale !== undefined &&
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
        // // scaleX={scale}
        // scaleY={scale}
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
        <PlantMap />
      </Stage>
    </>
  );
};
export default CanvasComponent;
