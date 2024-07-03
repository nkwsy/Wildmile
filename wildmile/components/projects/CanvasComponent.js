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

  // Pinch zoom for mobile
  function getDistance(p1, p2) {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  }

  function getCenter(p1, p2) {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  }
  var lastCenter = null;
  var lastDist = 0;
  var dragStopped = false;

  const handlePinch = (e) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();

    var touch1 = e.evt.touches[0];
    var touch2 = e.evt.touches[1];

    // we need to restore dragging, if it was cancelled by multi-touch
    if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
      stage.startDrag();
      dragStopped = false;
    }

    if (touch1 && touch2) {
      // if the stage was under Konva's drag&drop
      // we need to stop it, and implement our own pan logic with two pointers
      if (stage.isDragging()) {
        dragStopped = true;
        stage.stopDrag();
      }

      var p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      var p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };

      if (!lastCenter) {
        lastCenter = getCenter(p1, p2);
        return;
      }
      var newCenter = getCenter(p1, p2);

      var dist = getDistance(p1, p2);

      if (!lastDist) {
        lastDist = dist;
      }

      // local coordinates of center point
      var pointTo = {
        x: (newCenter.x - stage.x()) / stage.scaleX(),
        y: (newCenter.y - stage.y()) / stage.scaleX(),
      };

      var scale = stage.scaleX() * (dist / lastDist);

      stage.scaleX(scale);
      stage.scaleY(scale);

      // calculate new position of the stage
      var dx = newCenter.x - lastCenter.x;
      var dy = newCenter.y - lastCenter.y;

      var newPos = {
        x: newCenter.x - pointTo.x * scale + dx,
        y: newCenter.y - pointTo.y * scale + dy,
      };

      stage.position(newPos);

      lastDist = dist;
      lastCenter = newCenter;
    }
  };

  const handleTouchEnd = (e) => {
    lastDist = 0;
    lastCenter = null;
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
        onTouchStart={handlePinch}
        onTouchEnd={handleTouchEnd}
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
