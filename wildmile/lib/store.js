// import { create } from "zustand";

// import { useRef } from "react";

// const useStore = create((set) => ({
//   selectedModule: { _id: false, module: "none" },
//   newModules: [],
//   removedModules: [],
//   selectedCell: new Map(),
//   selectedPlantCell: new Map(),
//   cells: new Map(),
//   mode: "edit",
//   editMode: false,
//   plantsVisible: true,
//   modsVisible: true,
//   plants: [],
//   individualPlants: [],
//   triggerUpdate: false,
//   layers: [
//     // Initially, refs will be null, you might need to handle refs differently
//     { id: "modCells", visible: true, ref: null },
//     { id: "plantCells", visible: true, ref: null },
//   ],
//   // Actions
//   setSelectedModule: (module) => set(() => ({ selectedModule: module })),
//   addNewModule: (module) =>
//     set((state) => ({ newModules: [...state.newModules, module] })),
//   removeModule: (module) =>
//     set((state) => ({ removedModules: [...state.removedModules, module] })),

//   // Add more actions as needed
// }));

// export default useStore;
