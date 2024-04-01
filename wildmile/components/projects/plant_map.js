"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useReducer,
  useContext,
  useMemo,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import CanvasContext, { useClient, plantCellReducer } from "./context_mod_map";
import { PlantCellGen } from "./mod_util";
import { set } from "mongoose";

export function UpdateIndividualPlants({ triggerUpdate }) {
  // const { setIndividualPlants } = useContext(CanvasContext);

  const { dispatch } = useClient();
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

      dispatch({ type: "ADD_INDIVIDUAL_PLANTS", payload: data });
      // setIndividualPlants(data);
    }

    fetchData();
  }, [triggerUpdate, searchParams, pathname]); // triggerUpdate is now a dependency

  return null; // This component doesn't render anything
}

export function GetAllPlants({ triggerUpdate }) {
  const { setPlants } = useContext(CanvasContext);
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
      const response = await fetch(`${pathname}/plants/plants`, {
        next: { tags: ["individualPlants"] },
      });
      console.log("Fetching and updating plants...");
      const raw_response = await response.json();
      // Simulate fetching data
      const data = JSON.parse(raw_response);
      // Call oleetModules or similar function to update the state
      setPlants(data);
    }

    fetchData();
  }, [triggerUpdate, searchParams, pathname, setPlants]); // triggerUpdate is now a dependency

  return null; // This component doesn't render anything
}

export function PlantMap({ children }) {
  // const clientValues = useClient();
  const { plantRef, mode, triggerUpdate, modRef, gridRef, modules } =
    useClient();
  console.log("PlantMap client values: ", plantRef, mode);
  const clientValues = {
    plantRef,
    mode,
    triggerUpdate,
    modRef,
    gridRef,
    modules,
  };
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
    return null; // Or return null if you don't want to render anything
  }

  return (
    <>
      {/* <CanvasContext.Provider> */}
      <GetAllPlants triggerUpdate={triggerUpdate} />
      <UpdateIndividualPlants triggerUpdate={triggerUpdate} />
      {children}
      <CreatePlantCellLayer />
      {/* </CanvasContext.Provider> */}
    </>
  );
}

export function CreatePlantCellLayer(props) {
  const {
    cellWidth,
    cellHeight,
    modules,
    plantRef,
    togglePlantCellSelection,
    setPlantCells,
    dispatch,
  } = useClient();
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

  // Set the plantCells for the context
  // useEffect(() => {}, [groups, setPlantCells]); // Depend on groups and setPlantCells
  // useEffect to handle side effects, like updating the canvas
  // Dispatch an action to update the plant cells whenever groups change
  useEffect(() => {
    // Dispatch an action to update the plant cells whenever groups change
    dispatch({ type: "setPlantCells", payload: groups });
  }, [groups, dispatch]);
  // dispatch({ type: "setPlantCells", payload: groups });
  useEffect(() => {
    const layer = plantRef.current;
    if (!layer) {
      return;
    }
    // console.log("CreatePlantCellLayer: ", setPlantCells);
    // Add new groups to the layer
    groups.forEach((group) => {
      layer.add(group.konva_object);
    });
    return () => {
      groups.forEach((group) => {
        group.konva_object.remove();
      });
    };
  }, [groups, plantRef]); // Effect depends on groups and modRef
  //   groups.forEach((group) => {
  //     layer.add(group);
  //   });
  //   // Cleanup function to remove all groups when the component unmounts or before re-running the effect
  //   return () => {
  //     groups.forEach((group) => {
  //       group.remove();
  //     });
  //   };
  // }, [groups, plantRef]); // Effect depends on groups and modRef

  // console.log("PlantCellLayer: ", groups);
  return null;
}
