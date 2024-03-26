"use client";
// In CanvasBase.js
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
import useSWR from "swr";
import { usePathname, useSearchParams } from "next/navigation";
// import { UpdatePlants } from "./plant_map";

useStrictMode(true);

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

// export function LoadMods({ newMods }) {
//   useEffect(() => {
//     async function fetchData() {
//       const pathname = usePathname();
//       const searchParams = useSearchParams("");
//       const setModules = useContext(CanvasContext);
//       const mods = searchParams.get("");
//       const response = await fetch(`${pathname}/edit`);
//       const data = await response.json();
//       console.log("LoadMods", data);
//       newMods(data);
//     }
//     newMods();
//   }, [fetchData]);
//   return null;
// }

export function UpdateModules({ triggerUpdate }) {
  const { setModules } = useContext(CanvasContext);
  const pathname = usePathname();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    async function fetchData() {
      // Fetch and update logic here
      // const mods = searchParams.get("");
      const response = await fetch(`${pathname}/edit`, {
        next: { tags: ["modules"] },
      });
      const modData = await response.json();
      console.log("Fetching and updating modules...");
      // Simulate fetching data
      const data = JSON.parse(modData);
      // Call setModules or similar function to update the state
      setModules(data);
    }

    fetchData();
  }, [triggerUpdate, searchParams, pathname, setModules]); // triggerUpdate is now a dependency

  return null; // This component doesn't render anything
}

///
/// ModMapWrapper
///
export const ModMapWrapper = ({ children }) => {
  const [selectedModule, setSelectedModule] = useState({
    _id: false,
    module: "none",
  });
  const [newModules, setNewModules] = useState([]);
  const [removedModules, setRemovedModules] = useState([]);
  const [selectedCell, setSelectedCell] = useState(new Map());
  const [selectedPlantCell, setSelectedPlantCell] = useState(new Map());
  const [cells, setCells] = useState(new Map());
  // Sets the exploration mode of the map
  const [mode, setMode] = useState("plants");
  const [editMode, setEditMode] = useState(false);
  const gridRef = useRef(null);
  const selectedCellRef = useRef(null);
  const plantRef = useRef(null);
  const [plants, setPlants] = useState([]);
  const [individualPlants, setIndividualPlants] = useState([]);
  const modRef = useRef(null);
  const [triggerUpdate, setTriggerUpdate] = useState(false);
  const handleSomeUpdate = () => {
    // This function is called when you want to trigger the update in UpdateModules
    setTriggerUpdate((prev) => !prev); // Toggle the state to trigger useEffect in UpdateModules
  };

  // Handle the toggle for the cell selection
  const toggleCellSelection = (x, y, id) => {
    setSelectedCell((prevCells) => {
      const key = `${x},${y}`;
      const rect_id = `#${id}`;
      // const rect = modRef.current.find(id);
      console.log("toggleCellSelection rect", id);
      const newCells = new Map(prevCells);
      if (newCells.has(key)) {
        id.strokeWidth(0.1);
        newCells.delete(key);
      } else {
        newCells.set(key, { x, y, id });
        id.strokeWidth(6);
        id.moveToTop();
      }
      return newCells;
    });
  };

  // updates the stroke width of selected cell
  const updateSelectedCellStrokeWidth = () => {
    selectedCell.forEach((cell) => {
      // console.log("updateSelectedCellStrokeWidth", cell.x);
      cell.id.strokeWidth(0.2);
    });
  };
  // clears the selected cells
  const clearSelectedCells = () => {
    console.log("clearSelectedCells");
    updateSelectedCellStrokeWidth();
    setSelectedCell(new Map());
  };
  // utility to check if cell is selected
  const isCellSelected = (x, y) => {
    return selectedCells.has(`${x},${y}`);
  };

  // utility to return the selected cells
  const returnSelectedCells = () => {
    return selectedCell;
  };

  // Toggle Plant Cell Selection

  // Handle the toggle for the cell selection
  const togglePlantCellSelection = (x, y, id) => {
    setSelectedCell((prevCells) => {
      const key = `${x},${y}`;
      const rect_id = `#${id}`;
      // const rect = modRef.current.find(id);
      console.log("toggleCellSelection rect", id);
      const newCells = new Map(prevCells);
      if (newCells.has(key)) {
        id.strokeWidth(0.1);
        newCells.delete(key);
      } else {
        newCells.set(key, { x, y, id });
        id.strokeWidth(6);
        id.moveToTop();
      }
      return newCells;
    });
  };

  // updates the stroke width of selected cell
  const updateSelectedPlantCellStrokeWidth = () => {
    selectedCell.forEach((cell) => {
      // console.log("updateSelectedCellStrokeWidth", cell.x);
      cell.id.strokeWidth(0.2);
    });
  };
  // clears the selected cells
  const clearSelectedPlantCells = () => {
    console.log("clearSelectedCells");
    updateSelectedCellStrokeWidth();
    setSelectedCell(new Map());
  };
  // utility to check if cell is selected
  const isPlantCellSelected = (x, y) => {
    return selectedCells.has(`${x},${y}`);
  };

  // utility to return the selected cells
  const returnSelectedPlantCells = () => {
    return selectedCell;
  };

  // useEffect to log selected cells
  useEffect(() => {
    console.log("Selected Cells:", selectedCell);
  }, [selectedCell]);

  const values = {
    returnSelectedCells,
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
    cells,
    setCells,
    mode,
    setMode,
    editMode,
    setEditMode,
    isCellSelected,
    clearSelectedCells,
    triggerUpdate,
    handleSomeUpdate,
    gridRef,
    plantRef,
    modRef,
    setNewModules,
    newModules,
    setRemovedModules,
    removedModules,
    setPlants,
    plants,
    setIndividualPlants,
    individualPlants,
    togglePlantCellSelection,
    selectedPlantCell,
    setSelectedPlantCell,
    clearSelectedPlantCells,
    isPlantCellSelected,
    returnSelectedPlantCells,
  };
  return (
    // <div>
    <>
      <CanvasContext.Provider value={values}>{children}</CanvasContext.Provider>
    </>
    // </div>
  );
};

export const CanvasBase = ({ children, width, height }) => {
  console.log("CanvasBase", width, height);
  const {
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    toggleCellSelection,
    cells,
    setCells,
    mode,
    setMode,
    editMode,
    setEditMode,
    isCellSelected,
    clearSelectedCells,
    triggerUpdate,
    handleSomeUpdate,
    gridRef,
    plantRef,
    modRef,
    newModules,
    setNewModules,
    removedModules,
    setRemovedModules,
    setPlants,
    plants,
    setIndividualPlants,
    individualPlants,
    togglePlantCellSelection,
    selectedPlantCell,
    setSelectedPlantCell,
    clearSelectedPlantCells,
    isPlantCellSelected,
    returnSelectedPlantCells,
  } = useContext(CanvasContext);

  const [rotation, setRotation] = useState(0);
  const [modules, setModules] = useState([]);
  const [triggerUpdateMod, setTriggerUpdateMod] = useState(false);

  const [scale, setScale] = useState(1);
  const [cols, setCols] = useState(width); // Set initial value of cols to width
  const [rows, setRows] = useState(height); // Set initial value of rows to height

  useEffect(() => {
    setTriggerUpdateMod((prev) => !prev);
  }, [modules]);

  // handle updating the new modules
  useEffect(() => {
    console.log("New Modules:", newModules, modules);
    setModules((prevModules) => [...prevModules, ...newModules]);
    setSelectedCell(new Map());

    // setNewModules([]);
  }, [newModules]);

  // handle updating the removed modules
  useEffect(() => {
    console.log("Removed Modules:", removedModules, modules);
    setModules((prevModules) =>
      prevModules.filter(
        (module) =>
          !removedModules.some(
            (removedModule) => removedModule._id === module._id
          )
      )
    );

    // Optionally, clear the removedModules if needed
    setSelectedCell(new Map());
  }, [removedModules]);

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

  // useEffect to log updated modules
  useEffect(() => {
    console.log("Updated Modules:", modules);
  }, [modules]);

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

  useEffect(() => {
    setCols(width);
  }, [width]);
  useEffect(() => {
    setRows(height);
  }, [height]);

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
  const [cellWidth, setCellWidth] = useState(20);
  const [cellHeight, setCellHeight] = useState(cellWidth * 3);

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
    clearSelectedCells,
    mode,
    setMode,
    editMode,
    setEditMode,
    isCellSelected,
    triggerUpdate,
    handleSomeUpdate,

    setIsFormOpen,
    cells,
    setCells,
    triggerUpdate,
    handleSomeUpdate,
    setPlants,
    plants,
    setIndividualPlants,
    individualPlants,
    togglePlantCellSelection,
    selectedPlantCell,
    setSelectedPlantCell,
    clearSelectedPlantCells,
    isPlantCellSelected,
    returnSelectedPlantCells,
  };
  if (!isClient) {
    console.log("isClient:", isClient);
    return null;
  }
  return (
    <>
      <CanvasContext.Provider value={value}>
        <div>
          <UpdateModules triggerUpdate={triggerUpdate} />
          {/* <button onClick={handleSomeUpdate}>Update Modules</button> */}
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
            <CreateRectLayer triggerUpdate={triggerUpdateMod} />
            <Layer ref={plantRef}></Layer>
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

export function CreateRectLayer(props) {
  const {
    cellWidth,
    cellHeight,
    rows,
    cols,
    modRef,
    modules,
    toggleCellSelection,
    selectedCell,
    cells,
    setCells,
  } = useContext(CanvasContext);
  console.log(
    "CreateRectLayer:",
    cellWidth,
    cellHeight,
    rows,
    cols,
    modRef
    // modules
  );
  // useMemo to calculate groups based on dependencies
  const groups = useMemo(() => {
    const newGroups = [];
    for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
      for (let colIndex = 0; colIndex < cols; colIndex++) {
        let cellShape = CellGen({
          x: rowIndex,
          y: colIndex,
          cellWidth,
          cellHeight,
          modules,
          toggleCellSelection,
        });
        newGroups.push(cellShape);
      }
    }
    return newGroups;
  }, [modules]); // Include modules in the dependency array
  // rows, cols, cellWidth, cellHeight,
  // useEffect to handle side effects, like updating the canvas
  useEffect(() => {
    const layer = modRef.current;
    if (!layer) {
      return;
    }

    // Clear existing content
    // layer.clear();

    // Add new groups to the layer
    groups.forEach((group) => {
      layer.add(group);
      // setCells((prevCells) => {
      //   const newCells = new Map(prevCells);
      //   const key = `${group.x},${group.y}`;
      //   newCells.set(key, group);
      // });
    });

    // layer.add(cells);
    // Redraw the layer to display the new content
    // layer.draw();

    // Cleanup function to remove all groups when the component unmounts or before re-running the effect
    return () => {
      groups.forEach((group) => {
        group.remove();
      });
    };
  }, [groups, modRef]); // Effect depends on groups and modRef

  return null;
}

export function CreateGridLayer({ initModules }) {
  const {
    modRef,
    modules,
    setModules,
    cellWidth,
    cellHeight,
    rows,
    cols,
    mode,
    selectedCell,
    // handleSomeUpdate,
    // setSelectedCell,
    // toggleCellSelection,
    // setSelectedModule,
    // setCellWidth,
    // setCellHeight,
    cells,
    setCells,
    // isCellSelected,
  } = useContext(CanvasContext);
  // useEffect(() => {
  //   setModules(initModules);
  // }, [initModules, setModules]);
  // useEffect(() => {
  //   handleSomeUpdate();
  // }, []);
}

export function useWindow() {
  console.log(window.innerWidth);
  return window.innerWidth;
}
export const useCanvas = () => React.useContext(CanvasContext);
