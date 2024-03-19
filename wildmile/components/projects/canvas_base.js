"use client";
// In CanvasBase.js
import React, { useState, useEffect, useRef, useContext } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import useSWR from "swr";
import { usePathname, useSearchParams } from "next/navigation";

import { CellGen, ModuleGen } from "./mod_util";
// export const CanvasContext = React.createContext();
import CanvasContext from "./context_mod_map";
// import Hydration from "lib/hydration";
import useStore from "/lib/store";
import { use } from "passport";
// import { ModuleFormModal } from "./module_form";
import { useMediaQuery } from "@mantine/hooks";
import { set } from "mongoose";
const Component = () => {
  const { key, updateKey } = useStore();

  // Use the state and actions in your component
};

export function LoadMods({ newMods }) {
  useEffect(() => {
    async function fetchData() {
      const pathname = usePathname();
      const searchParams = useSearchParams("");
      const setModules = useContext(CanvasContext);
      const mods = searchParams.get("");
      const response = await fetch(`${pathname}/edit`);
      const data = await response.json();
      console.log("LoadMods", data);
      newMods(data);
    }
    newMods();
  }, [fetchData]);
  return null;
}

export const ModMapWrapper = ({ children }) => {
  const [selectedModule, setSelectedModule] = useState({
    _id: false,
    module: "none",
  });
  const [selectedCell, setSelectedCell] = useState(new Map());
  // Sets the exploration mode of the map
  const [mode, setMode] = useState("plants");
  const [editMode, setEditMode] = useState(false);

  // Allows user to click to add to cell or remove from cell
  const toggleCellSelection = (x, y) => {
    setSelectedCell((prevCells) => {
      const key = `${x},${y}`;
      const newCells = new Map(prevCells);
      if (newCells.has(key)) {
        newCells.delete(key);
      } else {
        newCells.set(key, { x, y });
      }
      return newCells;
    });
  };

  const clearSelectedCells = () => {
    setSelectedCells(new Map());
  };

  const isCellSelected = (x, y) => {
    return selectedCells.has(`${x},${y}`);
  };

  const values = {
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
    mode,
    setMode,
    editMode,
    setEditMode,
    isCellSelected,
    clearSelectedCells,
  };
  return (
    <div>
      <CanvasContext.Provider value={values}>{children}</CanvasContext.Provider>
    </div>
  );
};

export const CanvasBase = ({ children, width, height }) => {
  const {
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
  } = useContext(CanvasContext);

  const [modules, setModules] = useState({});
  const gridRef = useRef(null);
  const selectedCellRef = useRef(null);
  const plantRef = useRef(null);
  const modRef = useRef(null);
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

  useEffect(() => {
    redrawLayerByName();
  }, [modules, setModules]);
  const handleLoadMods = (newMods) => {
    setModules(newMods);
  };
  // selectedModule useEffect
  useEffect(() => {
    console.log("Selected Module:", selectedModule);
    if (selectedModule._id) {
      console.log("Selected open:", selectedModule);
      //   ModuleFormModal(selectedModule);
      setIsFormOpen(true);
    }
  }, [selectedModule]);
  useEffect(() => {
    console.log("Selected Cell:", selectedCell);
    if (selectedModule._id) {
      console.log("Selected Cell open:", selectedCell);
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
    // stage.batchDraw();
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
    plantRef,
    modRef,
    modules,
    setModules,
    cellWidth,
    cellHeight,
    setCellWidth,
    setCellHeight,
    rows,
    cols,
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
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
            <Layer ref={modRef}></Layer>
            {children}
          </Stage>
        </div>
      </CanvasContext.Provider>
    </>
  );
};

export async function BaseGrid({ children, ...props }) {
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
export function CreateGridLayer({ initModules }) {
  const {
    modRef,
    modules,
    setModules,
    cellWidth,
    cellHeight,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
    setSelectedModule,
    setCellWidth,
    setCellHeight,
    rows,
    cols,
    mode,
  } = useContext(CanvasContext);
  setModules(initModules);
  useEffect(() => {
    if (!modRef.current) {
      return;
    }
    // Clear the layer before adding new elements
    modRef.current.clear();

    // Generate cells and optionally modules within each cell
    // Note: CellGen should now return a Konva shape, not a React component
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        const cellShape = CellGen({
          x: rowIndex,
          y: colIndex,
          cellWidth,
          cellHeight,
          toggleCellSelection,
          selectedCell,
          modules,
          setSelectedModule,
        });

        // Add the shape to the layer
        modRef.current.add(cellShape);
      }
    }

    // Redraw the layer to display the new shapes
    // modRef.current.batchDraw();
  }, [
    modRef,
    rows,
    cols,
    cellWidth,
    cellHeight,
    modules,
    selectedCell,
    toggleCellSelection,
    setSelectedModule,
  ]);
  // No need to return anything from this function if it's used for side effects only
}

// Does not do anything rn
export async function LoadModules() {
  const { setModules } = useContext(CanvasContext);
  const pathname = usePathname();
  const searchParams = useSearchParams("");

  useEffect(() => {
    const fetchData = async () => {
      const data = await LoadMods(pathname, searchParams);
      if (data) {
        setModules(data);
      }
    };

    fetchData();
  }, [pathname, searchParams, setModules]);
}

// export function CreateGridLayer(props) {
//   const {
//     modRef,
//     modules,
//     setModules,
//     cellWidth,
//     cellHeight,
//     selectedCell,
//     toggleCellSelection,
//     setSelectedModule,
//     rows,
//     cols,
//   } = useContext(CanvasContext);
//   useEffect(() => {
//     if (!modRef.current) {
//       return;
//     }

//   // Clear the layer before adding new elements
//   modRef.current.clear();
// // const pathname = usePathname();
// // const searchParams = useSearchParams("");

// // useEffect(() => {
// //   const fetchData = async () => {
// //     const data = await LoadMods(pathname, searchParams);
// //     if (data) {
// //       setModules(data);
// //     }
// //   };

// //   fetchData();
// // }, [pathname, searchParams, setModules]);

//   // Generate cells and optionally modules within each cell
//   const cells = Array.from({ length: rows }).map((_, rowIndex) =>
//     Array.from({ length: cols }).map((_, colIndex) => {
//       const cellProps = {
//         x: rowIndex,
//         y: colIndex,
//         cellWidth,
//         cellHeight,
//         toggleCellSelection,
//         selectedCell,
//         modules,
//         setSelectedModule,
//       };

//       // CellGen should return a Konva shape or a group of shapes
//       return <CellGen key={`${rowIndex}-${colIndex}`} {...cellProps} />;
//     })
//   );

//   const layer = modRef;
//   console.log("Layer:", layer);
//   console.log("Cells:", cells);

//   cells.map((rowCells, i) => layer.add(rowCells));

//   // return (
//   //   // <Layer ref={modRef}>
//   //     // {cells.map((rowCells, i) => (
//   //     //   <Group key={i}>{rowCells}</Group>
//   //     // ))}
//   //   // </Layer>
//   // );
// }

// export function CreateGridLayer({ ...props }) {
//   const {
//     modules,
//     setModules,
//     cellWidth,
//     cellHeight,
//     selectedCell,
//     setSelectedCell,
//     toggleCellSelection,
//     setSelectedModule,
//     setCellWidth,
//     setCellHeight,
//     rows,
//     cols,
//     mode,
//   } = useContext(CanvasContext);
//   const pathname = usePathname();
//   const searchParams = useSearchParams("");

//   useEffect(() => {
//     const fetchData = async () => {
//       const data = await LoadMods(pathname, searchParams);
//       // Do something with the data
//       if (data) {
//         setModules(data);
//       }
//     };

//     fetchData();
//   }, [pathname, searchParams]);
//   // useEffect(() => {
//   //   const fetchModules = async () => {
//   //     const mods = await LoadMods();
//   //     if (mods) {
//   //       setModules(mods);
//   //     }
//   //   };

//   //   fetchModules();
//   // }, []); // Empty dependency array means this effect runs once on mount

//   return (
//     <Layer name="mods">
//       {Array.from({ length: rows }, (_, i) => (
//         <Group key={i}>
//           {Array.from({ length: cols }, (_, j) => (
//             <CellGen
//               key={`${i}-${j}`}
//               x={i}
//               y={j}
//               cellWidth={cellWidth}
//               cellHeight={cellHeight}
//               toggleCellSelection={toggleCellSelection}
//               selectedCell={selectedCell}
//               modules={modules}
//               setSelectedModule={setSelectedModule}
//             />
//           ))}
//         </Group>
//       ))}
//     </Layer>
//   );
// }

export function useWindow() {
  console.log(window.innerWidth);
  return window.innerWidth;
}
export const useCanvas = () => React.useContext(CanvasContext);
