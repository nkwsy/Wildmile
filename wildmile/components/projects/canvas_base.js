"use client";
// In CanvasBase.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import { Grid, GridCol } from "@mantine/core";
import { Button } from "@mantine/core";
import useSWR from "swr";
import { CellGen, ModuleGen } from "./mod_util";
// export const CanvasContext = React.createContext();
import CanvasContext from "./context_mod_map";
// import Hydration from "lib/hydration";
import useStore from "/lib/store";
import { use } from "passport";
// import { ModuleFormModal } from "./module_form";
import { useMediaQuery } from "@mantine/hooks";
const Component = () => {
  const { key, updateKey } = useStore();

  // Use the state and actions in your component
};

export const LoadMods = () => {
  const { data, error } = useSWR("/api/modules", fetcher);
  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return <ModMap modules={data} />;
};

export const ModMapWrapper = ({ children }) => {
  const [selectedModule, setSelectedModule] = useState({
    _id: false,
    module: "none",
  });
  const values = { selectedModule, setSelectedModule };
  return (
    <div>
      <CanvasContext.Provider value={values}>{children}</CanvasContext.Provider>
    </div>
  );
};

export const CanvasBase = ({ children, width, height }) => {
  const { selectedModule, setSelectedModule } = useContext(CanvasContext);

  const gridRef = useRef(null);
  const [scale, setScale] = useState(1);
  const [cols, setCols] = useState(width); // Set initial value of cols to width
  const [rows, setRows] = useState(height); // Set initial value of rows to height
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
  useEffect(() => {
    setCols(width);
  }, [width]);
  useEffect(() => {
    setRows(height);
  }, [height]);

  // selectedModule useEffect
  useEffect(() => {
    console.log("Selected Module:", selectedModule);
    if (selectedModule._id) {
      console.log("Selected open:", selectedModule);
      //   ModuleFormModal(selectedModule);
      setIsFormOpen(true);
    }
  }, [selectedModule]);

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

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  //   const [cellWidth, setCellWidth] = useState(
  // typeof window !== "undefined" ? window.innerWidth / cols / 2 : 20
  //   );
  const [cellWidth, setCellWidth] = useState(20);
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
      setCellWidth(useWindow() / cols / 2);
      setCellHeight(cellWidth * 3);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [cols, cellWidth]); // Update when cols or cellWidth changes

  // Create default context for context provider
  const [isFormOpen, setIsFormOpen] = useState(false);

  const value = {
    cellWidth,
    cellHeight,
    setCellWidth,
    setCellHeight,
    rows,
    cols,
    selectedModule,
    setSelectedModule,
    setIsFormOpen,
  };
  if (!isClient) {
    console.log("isClient:", isClient);
    return null;
  }
  return (
    <>
      <CanvasContext.Provider value={value}>
        <div>
          <Stage
            ref={gridRef}
            width={containerSize.width}
            height={containerSize.height}
            scaleX={scale}
            scaleY={scale}
            onWheel={handleWheel}
            //   rotation={rotation}
            draggable
          >
            {children}
          </Stage>
        </div>
      </CanvasContext.Provider>
    </>
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
  const {
    cellWidth,
    cellHeight,
    setCellWidth,
    setCellHeight,
    rows,
    cols,
    selectedModule,
    setSelectedModule,
  } = useContext(CanvasContext);
  const modules = props.modules;
  console.log(props.value);
  console.log("Modules:", selectedModule);
  return (
    <Layer>
      {modules.map((module, index) => (
        <Group key={index}>
          <ModuleGen
            module={module}
            cellWidth={cellWidth}
            cellHeight={cellHeight}
            setSelectedModule={setSelectedModule}
          />
        </Group>
      ))}
    </Layer>
  );
}

export function CreateGridLayer({ ...props }) {
  const { cellWidth, cellHeight, setCellWidth, setCellHeight, rows, cols } =
    useContext(CanvasContext);
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

export function useWindow() {
  console.log(window.innerWidth);
  return window.innerWidth;
}
export const useCanvas = () => React.useContext(CanvasContext);
