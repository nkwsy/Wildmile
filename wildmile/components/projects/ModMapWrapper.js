"use client";
import React, { useState } from "react";
import { CanvasContext } from "./context_mod_map";

export const ModMapWrapper = ({ children }) => {
  const [modules, setModules] = useState({});
  const [selectedModule, setSelectedModule] = useState(null); // [1]
  const [selectedCell, setSelectedCell] = useState(null); // [2]
  const [mode, setMode] = useState("plants"); // [3]

  const [triggerUpdate, setTriggerUpdate] = useState(false);

  const handleSomeUpdate = () => {
    setTriggerUpdate((prev) => !prev);
  };

  const contextValue = {
    modules,
    setModules,
    triggerUpdate,
    handleSomeUpdate,
    selectedModule,
    setSelectedModule,
    selectedCell,
    setSelectedCell,
    mode,
    setMode,
  };

  return (
    <CanvasContext.Provider value={contextValue}>
      {children}
    </CanvasContext.Provider>
  );
};
