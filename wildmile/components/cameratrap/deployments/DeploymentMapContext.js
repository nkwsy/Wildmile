"use client";
import { createContext, useContext, useState } from "react";

const DeploymentMapContext = createContext();

export function DeploymentMapProvider({ children }) {
  const [selectedLocation, setSelectedLocation] = useState(null);

  const value = {
    selectedLocation,
    setSelectedLocation,
  };

  return (
    <DeploymentMapContext.Provider value={value}>
      {children}
    </DeploymentMapContext.Provider>
  );
}

export function useDeploymentMap() {
  const context = useContext(DeploymentMapContext);
  if (context === undefined) {
    throw new Error(
      "useDeploymentMap must be used within a DeploymentMapProvider"
    );
  }
  return context;
}
