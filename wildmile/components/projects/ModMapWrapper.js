"use client";
// Might not be useful
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
import CanvasBase from "./CB2";
// import { UpdatePlants } from "./plant_map";
import dynamic from "next/dynamic";

// useStrictMode(true);

// import { CellGen, ModuleGen } from "./mod_util";
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
  // console.log("ModMapWrapper", width, height);
  const [cellWidth, setCellWidth] = useState(20);
  const [cellHeight, setCellHeight] = useState(cellWidth * 3);
  const [newModules, setNewModules] = useState([]);
  const [removedModules, setRemovedModules] = useState([]);
  const [selectedCell, setSelectedCell] = useState(new Map());
  const [selectedPlantCell, setSelectedPlantCell] = useState(new Map());
  const [cells, setCells] = useState(new Map());
  const [cols, setCols] = useState(15); // Set initial value of cols to width
  const [rows, setRows] = useState(42); // Set initial value of rows to height
  const [modules, setModules] = useState([]);
  const [triggerUpdateMod, setTriggerUpdateMod] = useState(false);
  // Sets the exploration mode of the map
  const [mode, setMode] = useState("plants");
  const [editMode, setEditMode] = useState(false);
  const modRef = useRef(null);
  const gridRef = useRef(null);
  const selectedCellRef = useRef(null);
  const plantRef = useRef(null);
  const [plants, setPlants] = useState([]);
  const [individualPlants, setIndividualPlants] = useState([]);
  const [triggerUpdate, setTriggerUpdate] = useState(false);
  const handleSomeUpdate = () => {
    // This function is called when you want to trigger the update in UpdateModules
    setTriggerUpdate((prev) => !prev); // Toggle the state to trigger useEffect in UpdateModules
  };
  console.log("cols", cols);
  // useEffect(() => {
  //   setCols(width);
  // }, [width]);
  // useEffect(() => {
  //   setRows(height);
  // }, [height]);
  console.log("cols", cols);
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
    cellWidth,
    cellHeight,
    modules,
    setModules,
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
    cols,
    rows,
    triggerUpdateMod,
    setTriggerUpdateMod,
  };
  return (
    // <div>
    <>
      <CanvasContext.Provider value={values}>
        {children}
        <UpdateModules triggerUpdate={triggerUpdate} />
        <CanvasBase />
      </CanvasContext.Provider>
    </>
    // </div>
  );
};
