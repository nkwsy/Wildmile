"use client";

import { createContext, useContext, useState, useReducer } from "react";
const ClientContext = createContext();
export default ClientContext;
import { getIndexColor } from "./drawing_utils";
// import plants from "pages/api/plants";

import { SaveEditedPlantCells } from "./PlantEditingFunctions";

export const useClient = () => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
// only grab selected state
// use like   const selectedModule = useClient('selectedModule');
export const useClientState = (propertyName) => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientState must be used within its Provider");
  }
  // Directly access the 'state' object and then the property
  const stateValue = context.state[propertyName];
  if (stateValue === undefined) {
    throw new Error(
      `The property "${propertyName}" does not exist in the state`
    );
  }
  return stateValue;
};

export const useClientStatePath = (path) => {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientState must be used within its Provider");
  }

  // Split the path and reduce it to the nested value
  const stateValue = path.split(".").reduce((acc, part) => {
    if (acc && acc[part] !== undefined) {
      return acc[part];
    }
    throw new Error(`The path "${path}" could not be resolved in the context`);
  }, context);

  return stateValue;
};

// Define the initial state
// const initialState = {
//   selectedModule: { _id: false, module: "none" },
//   newModules: [],
//   removedModules: [],
//   selectedCell: new Map(),
//   cells: new Map(),
//   mode: "edit",
//   editMode: false,
//   plantsVisible: true,
//   modsVisible: true,
//   plants: [],
//   plantCells: [],
//   selectedPlantCell: new Map(),
//   selectedPlants: [],
//   individualPlants: [],
//   triggerUpdate: false,
//   layers: [],
// };

export function moveToTop(id) {
  const items = layers.slice();
  const item = items.find((i) => i.id === id);
  const index = items.indexOf(item);
  items.splice(index, 1);
  items.push(item);
  setLayers(items);
}

// use to generate key based on stuff. Helpful for looking up items in a map
export const generateKey = (arr) => arr.join("-");

const mapPlantCells = (state) => {
  const plant_cells = state.plantCells;
  const plants = state.plants;
  const map_individual_plants = state.individualPlants;
  const updatedPlantCells = new Map(state.plantCells);
  map_individual_plants.forEach((plant) => {
    const key = generateKey([plant.module.x, plant.module.y, plant.x, plant.y]);
    const cell = plant_cells.get(key);
    if (cell) {
      // Make sure the cell exists before trying to modify it
      cell.plant_id = plant.plant;
      cell.individual_plant_id = plant._id;
      // cell.attrs = plants.get(plant._id).colors;
      updatedPlantCells.set(key, cell);
    }
  });
  return updatedPlantCells;
};

export function selectPlantCell(plantCell, color) {
  const cell = plantCell.konva_object;
  cell.strokeWidth(1);
  cell.stroke(color);
  cell.opacity(1);
}
// get the color for the index when editing
function updatePlantsIndexColor(newPlants) {
  let index = 0;
  newPlants.forEach((plant, plantId) => {
    plant.selectionColor = getIndexColor(index);
    newPlants.set(plantId, plant);
    index++;
  });
  return newPlants;
}
export const plantCellReducer = (state, action) => {
  switch (action.type) {
    // Set the mode for plants
    // options: "editPlantCells", "editPlantTemplate", "harvest"
    case "SET_EDIT_MODE":
      const new_mode = action.payload;
      return { ...state, editMode: new_mode };

    //2: {"2,1" => Object}  key:'2,1' value: {id: 1, color: 'blue', x: 2, y: 1}
    case "SET_PLANTING_TEMPLATE":
      const planting_template = action.payload;
      return { ...state, plantingTemplate: planting_template };

    // TODO finish
    case "SET_PLANT_TEMPLATE_OPTIONS":
      const planting_template_options = action.payload;
      return { ...state, plantingTemplateOptions: planting_template_options };

    case "ADD_PLANT_TO_TEMPLATE":
      const planting_template_color = action.payload;
      const current_planting_for_template = state.selectedPlantId;
      const set_planting_to_template = state.plantingTemplateOptions;
      const current_planting_template = state.plantingTemplate;
      if (
        !set_planting_to_template ||
        !current_planting_template ||
        !planting_template_color
      ) {
        return state;
      }

      // iterate through current planting template.
      //  if the plant is the same as the current plant, set the color to null, else change it to the current plant
      const updatedPlantingTemplateOptions = set_planting_to_template.map(
        (option) => {
          if (option.id === planting_template_color.id) {
            if (option.plant === current_planting_for_template) {
              return { ...option, color: null };
            } else {
            }
            return { ...option, plant: current_planting_for_template };
          }
          return option;
        }
      );
      return {
        ...state,
        plantingTemplateOptions: updatedPlantingTemplateOptions,
      };
    // Make planting layer visible so you can deploy the templates
    case "MOD_LAYER_SELECTABLE":
      const modLayerSelectable_ = action.payload;

      return { ...state, modLayerSelectable: modLayerSelectable_ };
    case "setPlantCells":
      const groups = action.payload;
      const newCells = new Map();
      groups.forEach((group, index) => {
        const key = generateKey([
          group.module_location.x,
          group.module_location.y,
          group.x,
          group.y,
        ]);
        newCells.set(key, group);
        // Assuming each group has a unique identifier, like an index or id
        // newCells.set(index, group);
      });
      const updatedPlantCellsAfterSetting = mapPlantCells({
        ...state,
        plantCells: newCells,
      });

      console.log("PlantCells: ", newCells);
      return { ...state, plantCells: updatedPlantCellsAfterSetting };

    case "CLEAR_PLANT_CELLS":
      // Create a new Map to clear the cells, side effects should be handled outside
      return { ...state, plantCells: new Map() };

    // Logs plant cells which are clicked by user
    case "TOGGLE_PLANT_CELL_SELECTION":
      const plantCell = action.payload;
      const key = generateKey([
        plantCell.module_location.x,
        plantCell.module_location.y,
        plantCell.x,
        plantCell.y,
      ]);

      const current_selected_plant_cells = state.selectedPlantCell;
      const current_plant_cells_to_edit = state.selectedPlantCellsToEdit;
      const toggle_in_edit_mode = state.editMode;
      const current_selected_plantId = state.selectedPlantId;
      const current_selected_plants = state.selectedPlants;
      const plant_removal_tool = state.plantRemovalTool;
      const newPlantCellsToEdit = new Map(current_plant_cells_to_edit);
      const newPlantCells = new Map(current_selected_plant_cells);
      // if in edit mode and plant selected, add to selectedPlantCellsToEdit
      if (current_selected_plantId && toggle_in_edit_mode) {
        if (newPlantCellsToEdit.has(key)) {
          plantCell.new_plant_id = null;
          newPlantCellsToEdit.delete(key);
        } else {
          plantCell.new_plant_id = current_selected_plantId;
          newPlantCellsToEdit.set(key, plantCell);
          let plant_selection = current_selected_plants.get(
            current_selected_plantId
          );
          selectPlantCell(plantCell, plant_selection.selectionColor);
        }
        return { ...state, selectedPlantCellsToEdit: newPlantCellsToEdit };
      }
      // Check if the key already exists
      // The key doesn't exist, so insert the new entry
      if (newPlantCells.has(key)) {
        newPlantCells.delete(key);
      }
      if (plant_removal_tool) {
        if (newPlantCellsToEdit.has(key)) {
          plantCell.new_plant_id = null;
          newPlantCellsToEdit.delete(key);
        } else {
          plantCell.new_plant_id = null;
          newPlantCellsToEdit.set(key, plantCell);
          selectPlantCell(plantCell, "red");
        }
        return { ...state, selectedPlantCellsToEdit: newPlantCellsToEdit };
      } else {
        newPlantCells.set(key, plantCell);
      }
      return { ...state, selectedPlantCell: newPlantCells };

    case "CLEAR_SELECTED_PLANT_CELLS_TO_EDIT":
      return { ...state, selectedPlantCellsToEdit: new Map() };
    case "CLEAR_PLANT_CELL_SELECTIONS":
      return { ...state, selectedPlantCell: new Map() };
    case "SAVE_PLANT_INPUT":
      const selectedPlantCellsToSave = state.selectedPlantCellsToEdit;
      const saving = SaveEditedPlantCells({
        plantCells: selectedPlantCellsToSave,
      });
      console.log("Saving:", saving);
      return { ...state, selectedPlantCellsToEdit: new Map() };

    case "ADD_INDIVIDUAL_PLANTS":
      const individual_plants = action.payload;
      const updatedIndividualPlants = new Map(state.individualPlants);
      individual_plants.forEach((plant) => {
        const key = plant._id;
        updatedIndividualPlants.set(key, plant);
      });

      // Call the common function to map plant cells after adding individual plants
      const updatedPlantCellsAfterAddition = mapPlantCells({
        ...state,
        individualPlants: updatedIndividualPlants,
      });

      return {
        ...state,
        individualPlants: updatedIndividualPlants,
        plantCells: updatedPlantCellsAfterAddition,
      };

    case "REMOVE_INDIVIDUAL_PLANTS":
      const removed_plants = action.payload;
      const removedIndividualPlants = new Map(state.individualPlants);
      removed_plants.forEach((plant) => {
        removedIndividualPlants.delete(plant._id);
      });
      //
      return { ...state, individualPlants: removedIndividualPlants };
    // case "SET_SELECTED_PLANT_CELL":
    //   const { x, y, id } = action.payload;
    //   const key = `${x},${y}`;
    //   const newCells = new Map(state);
    //   if (newCells.has(key)) {
    //     id.strokeWidth(0.1); // Consider moving side effects out of the reducer
    //     newCells.delete(key);
    //   } else {
    //     id.strokeWidth(6); // Consider moving side effects out of the reducer
    //     id.moveToTop(); // Consider moving side effects out of the reducer
    //     newCells.set(key, { x, y, id });
    //   }
    //   return newCells;
    // Set up tool to remove plants
    // Valid options: "delete", "herbivory", "disease", "nutrients", "enviormental", "harvest", "competition", "pests", "unknown",
    // Set to False to clear the tool & selected plant cells
    case "TOGGLE_PLANT_REMOVAL_TOOL":
      const removal_type = action.payload;
      if (!removal_type) {
        return {
          ...state,
          plantRemovalTool: false,
          selectedPlantCellsToEdit: new Map(),
        };
      }
      return { ...state, plantRemovalTool: removal_type };
    case "TOGGLE_PLANT_SELECTION":
      const plant_id = action.payload;
      let newPlants = new Map(state.selectedPlants);
      if (newPlants.has(plant_id.id)) {
        newPlants.delete(plant_id.id);
      } else {
        newPlants.set(plant_id.id, plant_id);
      }
      newPlants = updatePlantsIndexColor(newPlants);

      return { ...state, selectedPlants: newPlants };

    // Single ID for a plant that is the focus
    case "TOGGLE_SELECTED_PLANT":
      const targetSelectedPlandId = action.payload;

      const oldSelectedPlantId = state.selectedPlantId;
      if (oldSelectedPlantId === targetSelectedPlandId) {
        return { ...state, selectedPlantId: null };
      }
      return {
        ...state,
        selectedPlantId: targetSelectedPlandId,
        plantRemovalTool: false,
      };
    case "ADD_PLANTS":
      const plants = action.payload;
      const updatedPlants = new Map(state.plants);
      plants.forEach((plant) => {
        const key = plant._id;
        updatedPlants.set(key, plant);
      });
      return { ...state, plants: updatedPlants };
    case "MAP_PLANT_CELLS":
      // Now simply call the common function for MAP_PLANT_CELLS
      const updatedPlantCells = mapPlantCells(state);
      return { ...state, plantCells: updatedPlantCells };

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

// export const cellReducer = (state, action) => {
//   switch (action.type) {
//     case "TOGGLE_CELL_SELECTION":
//       const { x, y, id } = action.payload;
//       const key = `${x},${y}`;
//       const newCells = new Map(state);
//       if (newCells.has(key)) {
//         id.strokeWidth(0.1); // Consider moving side effects out of the reducer
//         newCells.delete(key);
//       } else {
//         id.strokeWidth(6); // Consider moving side effects out of the reducer
//         id.moveToTop(); // Consider moving side effects out of the reducer
//         newCells.set(key, { x, y, id });
//       }
//       return newCells;

//     case "CLEAR_CELLS":
//       state.forEach((cell) => cell.id.strokeWidth(0.2)); // Consider moving side effects out of the reducer
//       return new Map();

//     default:
//       return state;
//   }
// };

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
