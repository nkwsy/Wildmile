"use client";
// In CanvasBase.js
import React, {
  useState,
  useEffect,
  useRef,
  useContext,
  useMemo,
  useReducer,
} from "react";
// import {
//   Stage,
//   Layer,
//   Rect,
//   Text,
//   Group,
//   Line,
//   useStrictMode,
// } from "react-konva";
import useSWR from "swr";
import { usePathname, useSearchParams } from "next/navigation";
// import { UpdatePlants } from "./plant_map";

// export const CanvasContext = React.createContext();
import CanvasContext, {
  useClientState,
  useClient,
  cellReducer,
  plantCellReducer,
} from "./context_mod_map";
// import Hydration from "lib/hydration";
import CellGen from "./mod_util";
// const CanvasComponent = dynamic(
//   () => import("components/projects/CanvasComponent"),
//   {
//     ssr: false,
//   }
// );

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

export function AllPlants() {
  // const { setModules } = useContext(CanvasContext);
  const pathname = usePathname();
  // const [searchParams] = useSearchParams();

  async function fetchData() {
    // Fetch and update logic here
    // const mods = searchParams.get("");
    const response = await fetch(`/api/plants/getAll`, {
      next: { tags: ["plants"] },
    });
    const modData = response.json();
    console.log("Fetching and updating plants...");
    // Simulate fetching data
    const data = JSON.parse(modData);
    // Call setModules or similar function to update the state
    // setModules(data);
  }

  return fetchData();
}

/// State Management
const defaultInitialState = {
  // selectedModule: { _id: false, module: "none" },
  // newModules: [],
  // removedModules: [],
  // selectedCell: new Map(),
  // cells: new Map(),
  // mode: "edit",
  editMode: false,
  // plantsVisible: true,
  // modsVisible: true,
  // plants: [],
  // triggerUpdate: false,
  // layers: [],
  plants: new Map(),
  plantCells: new Map(),
  selectedPlantCell: new Map(),
  selectedPlantCellsToEdit: new Map(),
  selectedPlants: new Map(),
  individualPlants: new Map(),
  selectedPlantId: null,
  plantingTemplateOptions: null,
  plantingTemplate: null,
  plantingTemplateDeploy: false,
  plantRemovalTool: false,
  modLayerSelectable: null,
  plantCellHover: null,
};

const initializeState = (initialProps) => {
  // You can modify the initial state based on props if needed
  return { ...defaultInitialState };
};

import CanvasComponent from "./CanvasComponent";
import {
  setCellPlantFill,
  toggleCellFill,
  toggleCellOff,
  toggleCellOn,
  setCellOnStroke,
  setCellBlank,
} from "./drawing_utils";

///
/// ModMapWrapper
///
export const ModMapWrapper = ({ children }) => {
  const [state, dispatch] = useReducer(plantCellReducer, {}, initializeState);

  const [selectedModule, setSelectedModule] = useState({
    _id: false,
    module: "none",
  });
  const [newModules, setNewModules] = useState([]);
  const [removedModules, setRemovedModules] = useState([]);
  const [selectedCell, setSelectedCell] = useState(new Map());
  // const [selectedCells, dispatch] = useReducer(cellReducer, new Map());

  const [selectedPlantCell, setSelectedPlantCell] = useState(new Map());
  const [cells, setCells] = useState(new Map());
  // const [plantCells, setPlantCells] = useState([]);
  // const [plantCells, dispatch] = useReducer(plantCellReducer, new Map());
  const [selectedPlants, setSelectedPlants] = useState([]); // Sets the exploration mode of the map
  // Modes
  const [mode, setMode] = useState("edit");
  // const [editMode, setEditMode] = useState(false);
  const [plantsVisible, setPlantsVisible] = useState(true);
  const [modsVisible, setModsVisible] = useState(true);
  const gridRef = useRef(null);
  const modRef = useRef(null);
  const plantRef = useRef(null);

  const selectedCellRef = useRef(null);
  const [plants, setPlants] = useState([]);

  const [individualPlants, setIndividualPlants] = useState([]);
  const [triggerUpdate, setTriggerUpdate] = useState(false);

  const [layers, setLayers] = useState([
    { id: "modCells", visible: modsVisible, ref: modRef },
    { id: "plantCells", visible: plantsVisible, ref: plantRef },
  ]);
  const handleSomeUpdate = () => {
    // This function is called when you want to trigger the update in UpdateModules
    setTriggerUpdate((prev) => !prev); // Toggle the state to trigger useEffect in UpdateModules
  };

  const setPlantCells = (groups) => {
    dispatch({ type: "setPlantCells", payload: groups });
  };

  // useEffect to map the
  // setPlantCells(["test"]);
  // Function to move layer to top
  function moveToTop(id) {
    const items = layers.slice();
    const item = items.find((i) => i.id === id);
    const index = items.indexOf(item);
    items.splice(index, 1);
    items.push(item);
    setLayers(items);
  }

  // useEffect to update plant cells if individual plants are updated
  useEffect(() => {
    dispatch({ type: "MAP_PLANT_CELLS" });
  }, [individualPlants]);

  // useEffect to switch plant visibility
  useEffect(() => {
    console.log("Plants Visible:", plantsVisible);
    if (!gridRef.current) {
      return;
    }
    if (mode === "plants") {
      moveToTop("plantCells");
      dispatch({ type: "MAP_PLANT_CELLS" });
      // TODO integrate plants into context
      // setPlantsVisible(true);
      // setModsVisible(false);
    }
    if (mode === "modules") {
      moveToTop("modCells");
      // setPlantsVisible(false);
      // setModsVisible(true);
    }

    // if (mode === "edit") {
    //   moveToTop("modCells");
    // }
    else {
      // setPlantsVisible(false);
    }
  }, [mode]);

  // useEffect to update the plant layer visibility
  useEffect(() => {
    if (state.modLayerSelectable === true) {
      console.log("Plants Visible:", plantsVisible);
      if (!plantRef.current) {
        return;
      }
      moveToTop("modCells");
    }
    if (state.modLayerSelectable === false) {
      moveToTop("plantCells");
    }
  }, [state.modLayerSelectable]);
  // Handle the toggle for the cell selection

  // Attempt to use useReducer for cell selection
  // const toggleCellSelection = (x, y, id) => {
  //   dispatch({ type: "TOGGLE_CELL_SELECTION", payload: { x, y, id } });
  // };

  // const clearSelectedCells = () => {
  //   dispatch({ type: "CLEAR_CELLS" });
  // };

  const toggleCellSelection = (x, y, id, plantCell) => {
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
        id.strokeWidth(2);
        // id.moveToTop();
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

  // Toggle Plant Cell Selection with plant species's
  useEffect(() => {
    updateSelectedPlantCellStrokeWidth();
    let cells = state.plantCells;
    if (!state.editMode) {
      cells.forEach((cell) => {
        if (state.selectedPlants.has(cell.plant_id)) {
          toggleCellOn(cell);
          // cell.rect.moveToTop();
        } else {
          toggleCellOff(cell);
        }
      });
    }
  }, [state.selectedPlants]);

  // Toggle plant cell selection by clicking on cell to select
  useEffect(() => {
    // updateSelectedPlantCellStrokeWidth();
    let cells = state.plantCells;
    cells.forEach((cell) => {
      if (state.selectedPlantCell.has(cell.location_key)) {
        toggleCellOn(cell);
        // cell.rect.moveToTop();
      } else {
        toggleCellOff(cell);
      }
    });
  }, [state.selectedPlantCell]);

  // Toggle plant Cell Selection in edit mode
  useEffect(() => {
    let cells = state.plantCells;
    cells.forEach((cell) => {
      if (state.selectedPlantCellsToEdit.has(cell.location_key)) {
        const stroke_color = state.selectedPlantCellsToEdit.get(
          cell.location_key
        );
        // setCellOnStroke(cell, stroke_color.selectionColor);
      } else {
        toggleCellOff(cell);
      }
    });
  }, [state.selectedPlantCellsToEdit]);

  // state.selectedPlantCellsToEdit.forEach((stroke_color, location_key) => {
  //     const cell = state.plantCells.find((cell) => cell.location_key === location_key);
  //     if (cell) {
  //       setCellOnStroke(cell, stroke_color.selectionColor);
  //     }
  // update cell colors
  useEffect(() => {
    let cells = state.plantCells;
    let use_plants = state.plants;
    cells.forEach((cell) => {
      let plant_data = use_plants.get(cell.plant_id);
      if (plant_data) {
        setCellPlantFill(cell, plant_data);
      } else {
        // toggleCellFill(cell, "grey");
        setCellBlank(cell);
      }
    });
    // moveToTop("plantCells");
  }, [state.individualPlants]);
  // const updateSelectedPlantCellStrokeWidth = (key, plantCell) => {
  //   if (state.selectedPlantCell.has(key)) {
  //     toggleCellOff(plantCell);
  //   } else {
  //     toggleCellOn(plantCell);
  //   }
  // };

  // Handle the toggle for the plant cell selection
  const togglePlantCellSelection = (x, y, id, plantCell) => {
    console.log("togglePlantCellSelection", x, y, id);
    // update to use reducer
    console.log("current state", state);
    const key = `${plantCell.module_location.x}-${plantCell.module_location.y}-${plantCell.x}-${plantCell.y}`;
    // updateSelectedPlantCellStrokeWidth(key, plantCell);
    dispatch({
      type: "TOGGLE_PLANT_CELL_SELECTION",
      payload: plantCell,
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
    // editMode,
    // setEditMode,
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
    plantsVisible,
    modsVisible,
    layers,
    selectedPlants,
    setSelectedPlants,
    // plantCells,
    // setPlantCells,

    state,
    dispatch,
  };
  return (
    <>
      <CanvasContext.Provider value={values}>{children}</CanvasContext.Provider>
    </>
  );
};

/////
///// CanvasBase
/////   This is the main component for the canvas, it calls the CanvasComponent from another file which should be rendered w/o server side rendering
export const CanvasBase = ({ children, width, height }) => {
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
    // editMode,
    // setEditMode,
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
    layers,
    setPlantCells,
    dispatch,
  } = useClient(CanvasContext);

  console.log("CanvasBase", width, height);
  const [modules, setModules] = useState([]);
  const [triggerUpdateMod, setTriggerUpdateMod] = useState(false);

  const [cols, setCols] = useState(width); // Set initial value of cols to width
  const [rows, setRows] = useState(height); // Set initial value of rows to height
  const [cellWidth, setCellWidth] = useState(20);
  const [cellHeight, setCellHeight] = useState(cellWidth * 3);

  console.log("CanvasBase", width, height);
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

  useEffect(() => {
    setCols(width);
  }, [width]);
  useEffect(() => {
    setRows(height);
  }, [height]);

  // Rotate button function
  const rotateButton = (e) => {
    setRotation((prevRotation) => (prevRotation === 0 ? 270 : 0));
  };

  // Make sure user is client
  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    // editMode,
    // setEditMode,
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
    // containerSize,
    gridRef,
    layers,
    setPlantCells,
    dispatch,
  };
  if (!isClient) {
    console.log("isClient:", isClient);
    return null;
  }
  // const { plantsVisible, modsVisible } = useClient();
  return (
    <>
      <CanvasContext.Provider value={{ ...value }}>
        <div>
          <UpdateModules triggerUpdate={triggerUpdate} />
          <CanvasComponent></CanvasComponent>
          {children}
          {/* </Stage> */}
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

export default ModMapWrapper;
