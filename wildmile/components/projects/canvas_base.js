"use client";
// In CanvasBase.js
import React, { useState, useEffect, useRef } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import { Grid } from "@mantine/core";
import { Button } from "@mantine/core";
import useSWR from "swr";
import { CellGen, ModuleGen } from "./mod_util";
const CanvasContext = React.createContext();
import useStore from "/lib/store";

const Component = () => {
  const { key, updateKey } = useStore();

  // Use the state and actions in your component
};

export const CanvasBase = ({ children }) => {
  const [scale, setScale] = useState(1);
  //   const width = props.width;
  //   const height = props.height;
  const [zoomLevel, setZoomLevel] = useState(1);
  //   const { cols, width } = useStore();
  //   const cols = useStore;
  const [rows, height] = useStore();
  const gridRef = useRef(null);
  const stageRef = useRef();
  useEffect(() => {
    if (gridRef.current) {
      setContainerSize({
        width: gridRef.current.offsetWidth,
        height: gridRef.current.offsetHeight,
      });
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (gridRef.current) {
        setContainerSize({
          width: gridRef.current.offsetWidth,
          height: gridRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  //   const [cellWidth, setCellWidth] = useState(
  // typeof window !== "undefined" ? window.innerWidth / cols / 2 : 20
  //   );
  const [cellWidth, setCellWidth] = useState(200);
  const [cellHeight, setCellHeight] = useState(cellWidth * 3);

  const handleWheel = (e) => {
    e.evt.preventDefault();
    const scaleBy = 1.1;
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
    stage.batchDraw();
  };

  useEffect(() => {
    // Update the state to store the window size
    const handleResize = () => {
      setCellWidth(window.innerWidth / cols / 2);
      setCellHeight(cellWidth * 3);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cols, cellWidth]); // Update when cols or cellWidth changes

  // Create default context for context provider
  const value = {
    cellWidth,
    cellHeight,
    setCellWidth,
    setCellHeight,
    rows,
    cols,
  };
  if (!isClient) {
    console.log("isClient:", isClient);
    return null;
  }
  return (
    <CanvasContext.Provider value={value}>
      <Stage
        ref={stageRef}
        width={window.innerWidth}
        height={window.innerHeight}
        scaleX={scale}
        scaleY={scale}
        onWheel={handleWheel}
        //   rotation={rotation}
        draggable
      >
        {children}
      </Stage>
    </CanvasContext.Provider>
  );
};

export function BaseGrid({ children, ...props }) {
  const width = props.width;
  const height = props.height;
  console.log("width:", width);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [cols, setCols] = useState(width);
  const [rows, setRows] = useState(height);
  const initialCellWidth = window.innerWidth / cols / 2;
  const [cellWidth, setCellWidth] = useState(initialCellWidth); // Initialize with default or calculated values
  const [cellHeight, setCellHeight] = useState(cellWidth * 3); // Initialize with default or calculated values

  const value = {
    cellWidth,
    cellHeight,
    setCellWidth,
    setCellHeight,
    rows,
    cols,
  };

  return (
    <CanvasBase zoomLevel={zoomLevel} onZoomChange={setZoomLevel}>
      <CanvasContext.Provider value={value}>{children}</CanvasContext.Provider>
    </CanvasBase>
  );
}

export function CreateModuleLayer({ ...props }) {
  const modules = props.modules;
  return (
    <Layer>
      {modules.map((module, index) => (
        <Group key={index}>
          <ModuleGen module={module} cellWidth={20} cellHeight={60} />
        </Group>
      ))}
    </Layer>
  );
}

export function CreateGridLayer({ ...props }) {
  return (
    <Layer>
      {Array.from({ length: rows }, (_, i) => (
        <Group key={i}>
          {Array.from({ length: cols }, (_, j) => (
            <CellGen
              key={`${i}-${j}`}
              x={i}
              y={j}
              cellWidth={cellWidth}
              cellHeight={cellHeight}
            />
          ))}
        </Group>
      ))}
    </Layer>
  );
}
export const useCanvas = () => React.useContext(CanvasContext);
