"use client";
// contexts/ClientContext.js

import { createContext, useContext, useState, useReducer } from "react";
// import React from "react";
const ClientContext = createContext();
export default ClientContext;

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
// export const useClient = (selector) => {
//   const { state } = useContext(ClientContext);
//   return selector(state);
// };

// Define the initial state
const initialState = {
  selectedModule: { _id: false, module: "none" },
  newModules: [],
  removedModules: [],
  selectedCell: new Map(),
  cells: new Map(),
  mode: "edit",
  editMode: false,
  plantsVisible: true,
  modsVisible: true,
  plants: [],
  plantCells: [],
  selectedPlantCell: new Map(),
  selectedPlants: [],
  individualPlants: [],
  triggerUpdate: false,
  layers: [],
};

export function moveToTop(id) {
  const items = layers.slice();
  const item = items.find((i) => i.id === id);
  const index = items.indexOf(item);
  items.splice(index, 1);
  items.push(item);
  setLayers(items);
}
export const cellReducer = (state, action) => {
  switch (action.type) {
    case "TOGGLE_CELL_SELECTION":
      const { x, y, id } = action.payload;
      const key = `${x},${y}`;
      const newCells = new Map(state);
      if (newCells.has(key)) {
        id.strokeWidth(0.1); // Consider moving side effects out of the reducer
        newCells.delete(key);
      } else {
        id.strokeWidth(6); // Consider moving side effects out of the reducer
        id.moveToTop(); // Consider moving side effects out of the reducer
        newCells.set(key, { x, y, id });
      }
      return newCells;

    case "CLEAR_CELLS":
      state.forEach((cell) => cell.id.strokeWidth(0.2)); // Consider moving side effects out of the reducer
      return new Map();

    default:
      return state;
  }
};

export const plantCellReducer = (state, action) => {
  switch (action.type) {
    case "setPlantCells":
      const groups = action.payload;
      const newCells = new Map();
      groups.forEach((group, index) => {
        // Assuming each group has a unique identifier, like an index or id
        newCells.set(index, group);
      });
      console.log("PlantCells: ", newCells);
      return newCells;

    case "CLEAR_PLANT_CELLS":
      // Create a new Map to clear the cells, side effects should be handled outside
      return new Map();

    default:
      return state;
  }
};

// export const plantReducer = (state = initialState, action) => {};

// Define the reducer function
function reducer(state, action) {
  switch (action.type) {
    case "SET_SELECTED_MODULE":
      return { ...state, selectedModule: action.payload };
    case "ADD_NEW_MODULE":
      return { ...state, newModules: [...state.newModules, action.payload] };
    case "REMOVE_MODULE":
      return {
        ...state,
        removedModules: [...state.removedModules, action.payload],
      };
    // Add other action handlers as needed
    default:
      throw new Error("Unhandled action type: " + action.type);
  }
}

// export const ClientProvider = ({ children }) => {
//   const [client, setClient] = useState({}); // Initial client state
//   //   const gridRef = useRef(null);
//   //   const stageRef = useRef();
//   const [stageHeight, setStageHeight] = useState(0);
//   const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
//   const [rotation, setRotation] = useState(0);
//   const [modules, setModules] = useState({});
//   const updateClient = (newData) => {
//     setClient((prevClient) => ({ ...prevClient, ...newData }));
//   };

//   return (
//     <ClientContext.Provider value={{ client, updateClient }}>
//       {children}
//     </ClientContext.Provider>
//   );
// };
