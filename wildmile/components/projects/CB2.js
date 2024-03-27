"use client";
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";

import CanvasContext from "./context_mod_map";
export default function CanvasBase({ children }) {
  const {
    gridRef,
    plantRef,
    modRef,
    cols,
    rows,
    cellHeight,
    cellWidth,
    setCellHeight,
    setCellWidth,
  } = useContext(CanvasContext);

  const [rotation, setRotation] = useState(0);

  //   const [cellWidth, setCellWidth] = useState(20);
  //   const [cellHeight, setCellHeight] = useState(cellWidth * 3);
  const [scale, setScale] = useState(1);
  // Function to redraw layer by name
  const redrawLayerByName = () => {
    if (!gridRef.current || !modRef.current) {
      console.warn("Stage or mofref is not yet available");
      return;
    }
    const stage = gridRef.current.getStage(); // Get the Konva Stage instance
    const layer = modRef.current.getLayer(); // Get the Konva Layer instance
    console.log("redraw Layer:", layer);
    // layer.draw();
    // gridRef.current.batchDraw();
  };

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

  //   useEffect(() => {
  //     setCols(width);
  //   }, [width]);
  //   useEffect(() => {
  //     setRows(height);
  //   }, [height]);
  // Zoom functions
  const [zoomLevel, setZoomLevel] = useState(1);
  // const [rows, height] = useStore();
  const stageRef = useRef();
  useEffect(() => {
    if (gridRef.current) {
      setContainerSize({
        width: gridRef.current.offsetWidth,
        height: gridRef.current.offsetHeight,
      });
      console.log("Container Size:", containerSize);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        setContainerSize({
          width: gridRef.current.offsetWidth,
          height: gridRef.current.offsetHeight,
        });
        console.log("Container Size:", containerSize);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Rotate button function
  const rotateButton = (e) => {
    setRotation((prevRotation) => (prevRotation === 0 ? 270 : 0));
  };

  // Make sure user is client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  //   const [cellWidth, setCellWidth] = useState(
  // typeof window !== "undefined" ? window.innerWidth / cols / 2 : 20
  //   );

  // Function to handle zooming
  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.2;
    const stage = e.target.getStage();

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);
    const newPos = {
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
  };

  //   useEffect(() => {
  //     // Update the state to store the window size
  //     const handleResize = () => {
  //       setCellWidth(useWindow() / cols / 2);
  //       setCellHeight(cellWidth * 3);
  //     };

  //     window.addEventListener("resize", handleResize);
  //     return () => window.removeEventListener("resize", handleResize);
  //   }, [cols, cellWidth]); // Update when cols or cellWidth changes

  const value = {
    plantRef,
    modRef,
    cellWidth,
    cellHeight,
    setCellWidth,
    setCellHeight,

    rows,
    cols,
    gridRef,
    containerSize,
    scale,
    rotation,
    handleWheel,
  };

  //   if (!isClient) {
  //     console.log("isClient:", isClient);
  //     return null;
  //   }
  //   console.log("CanvasBase:", gridRef, plantRef, modRef, cols, rows);
  return (
    <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
  );
}

export function useWindow() {
  console.log(window.innerWidth);
  return window.innerWidth;
}
