"use client";
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import CanvasContext, { useClient } from "./context_mod_map";
import { PlantCellGen } from "./mod_util";

export function UpdateIndividualPlants({ triggerUpdate }) {
  const { setIndividualPlants } = useContext(CanvasContext);
  //   const router = useRouter();
  //   const params = useParams();
  const pathname = usePathname();
  const [searchParams] = useSearchParams();
  //   const { project, section } = router.query;
  console.log("UpdatePlants: ", pathname, searchParams);
  useEffect(() => {
    async function fetchData() {
      // Fetch and update logic here
      // const mods = searchParams.get("");
      const response = await fetch(`${pathname}/plants/individual-plants`, {
        next: { tags: ["plants"] },
      });
      console.log("Fetching and updating plants...");
      const raw_response = await response.json();
      // Simulate fetching data
      const data = JSON.parse(raw_response);
      // Call oleetModules or similar function to update the state
      setIndividualPlants(data);
    }

    fetchData();
  }, [triggerUpdate, searchParams, pathname, setIndividualPlants]); // triggerUpdate is now a dependency

  return null; // This component doesn't render anything
}

export function PlantMap({ children }) {
  const clientValues = useClient();
  const {
    individualPlants,
    plantRef,
    mode,
    triggerUpdate,
    modRef,
    gridRef,
    modules,
  } = clientValues;
  console.log("PlantMap client values: ", clientValues);
  const [isReady, setIsReady] = useState(false);

  // Function to check if all required values are valid
  const areValuesValid = () => {
    // Add any additional checks as necessary
    return (
      plantRef !== undefined &&
      mode !== undefined &&
      modRef?.current &&
      plantRef?.current &&
      gridRef?.current &&
      modules !== null
    );
  };

  useEffect(() => {
    // Check if all values are valid and update the state accordingly
    setIsReady(areValuesValid());
  }, [clientValues]); // Depend on the entire clientValues object

  // Early return if not all values are valid
  if (!isReady) {
    return <div>Loading...</div>; // Or return null if you don't want to render anything
  }
  return (
    <>
      {/* <CanvasContext.Provider> */}
      <UpdateIndividualPlants triggerUpdate={triggerUpdate} />
      {children}
      <CreatePlantCellLayer />
      {/* </CanvasContext.Provider> */}
    </>
  );
}

export function CreatePlantCellLayer(props) {
  const { cellWidth, cellHeight, modules, plantRef, togglePlantCellSelection } =
    useClient();

  // useMemo to calculate groups based on dependencies
  const groups = useMemo(() => {
    const newGroups = [];

    let cellShape = PlantCellGen({
      cellWidth,
      cellHeight,
      modules,
      togglePlantCellSelection,
    });

    return cellShape;
  }, [modules]); // Include modules in the dependency array
  // useEffect to handle side effects, like updating the canvas
  useEffect(() => {
    const layer = plantRef.current;
    if (!layer) {
      return;
    }

    // Add new groups to the layer
    groups.forEach((group) => {
      layer.add(group.konva_object);
    });

    // Cleanup function to remove all groups when the component unmounts or before re-running the effect
    return () => {
      groups.forEach((group) => {
        group.konva_object.remove();
      });
    };
  }, [groups, plantRef]); // Effect depends on groups and modRef

  return null;
}
