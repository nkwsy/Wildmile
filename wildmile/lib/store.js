import { create } from "zustand";

const useStore = create((set) => ({
  key: "initialValue", // Example state
  // Define actions to mutate the state
  updateKey: (newKey) => set(() => ({ key: newKey })),
}));

export default useStore;
