"use client";
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import CanvasContext from "./context_mod_map";

export function UpdatePlants({ triggerUpdate }) {
  console.log("UpdatePlants: ", triggerUpdate);
  const { setPlants } = useContext(CanvasContext);
  //   const params = useParams();
  const pathname = usePathname();
  const [searchParams] = useSearchParams();
  console.log("UpdatePlants: ", pathname, searchParams);
  useEffect(() => {
    async function fetchData() {
      // Fetch and update logic here
      // const mods = searchParams.get("");
      const response = await fetch(`projects/api/plants`, {
        next: { tags: ["plants"] },
      });
      const raw_response = await response.json();
      console.log("Fetching and updating plants...");
      // Simulate fetching data
      const data = JSON.parse(raw_response);
      // Call setModules or similar function to update the state
      setPlants(data);
    }

    fetchData();
  }, [triggerUpdate, searchParams, pathname, setPlants]); // triggerUpdate is now a dependency

  return null; // This component doesn't render anything
}

export function PlantMap({ children }) {
  const { plants, plantRef, mode, triggerUpdate } = useContext(CanvasContext);
  return (
    <>
      {/* <CanvasContext.Provider> */}
      <UpdatePlants triggerUpdate={triggerUpdate} />
      {children}
      {/* </CanvasContext.Provider> */}
    </>
  );
}
