"use client";
import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
import dynamic from "next/dynamic";
import { useClient } from "./context_mod_map";

const CellGen = dynamic(() => import("./mod_util"), {
  ssr: false,
});

export default function CreateRectLayer(props) {
  const {
    cellWidth,
    cellHeight,
    rows,
    cols,
    modRef,
    modules,
    toggleCellSelection,
  } = useClient();

  // State to manage the readiness of the values
  const [areValuesReady, setAreValuesReady] = useState(false);

  useEffect(() => {
    // Function to check if all required values are available
    const checkValues = () => {
      return (
        cellWidth &&
        cellHeight &&
        rows &&
        cols &&
        modRef &&
        modules &&
        toggleCellSelection
      );
    };

    // If all values are ready, set the state to true
    if (checkValues()) {
      setAreValuesReady(true);
    } else {
      // If not all values are ready, retry after a delay
      const timeoutId = setTimeout(() => {
        console.log("Retrying to check values...");
        setAreValuesReady(checkValues()); // This will trigger the useEffect again
      }, 1000); // Retry after 1 second

      // Cleanup function to clear the timeout
      return () => clearTimeout(timeoutId);
    }
  }, [cellWidth, cellHeight, rows, cols, modRef, modules, toggleCellSelection]); // Dependencies

  // useMemo to calculate groups based on dependencies, only if all values are ready
  const groups = useMemo(() => {
    if (!areValuesReady) return [];

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
  }, [
    areValuesReady,
    cellWidth,
    cellHeight,
    rows,
    cols,
    modules,
    toggleCellSelection,
  ]);

  useEffect(() => {
    if (!areValuesReady) return;

    const layer = modRef.current;
    if (!layer) return;

    // Add new groups to the layer
    groups.forEach((group) => {
      layer.add(group);
    });

    // Cleanup function to remove all groups when the component unmounts or before re-running the effect
    return () => {
      groups.forEach((group) => {
        group.remove();
      });
    };
  }, [areValuesReady, groups, modRef]); // Effect depends on areValuesReady, groups, and modRef

  return null;
}

// "use client";

// import React, { useState, useEffect, useRef, useContext, useMemo } from "react";
// import {
//   Stage,
//   Layer,
//   Rect,
//   Text,
//   Group,
//   Line,
//   useStrictMode,
// } from "react-konva";

// import { useClient } from "./context_mod_map";
// import dynamic from "next/dynamic";
// const CellGen = dynamic(() => import("./mod_util"), {
//   ssr: false,
// });

// // import CellGen from "./mod_util";

// export default function CreateRectLayer(props) {
//   const {
//     cellWidth,
//     cellHeight,
//     rows,
//     cols,
//     modRef,
//     modules,
//     toggleCellSelection,
//   } = useClient();
//   console.log(
//     "CreateRectLayer:",
//     cellWidth,
//     cellHeight,
//     rows,
//     cols,
//     modRef
//     // modules
//   );
//   // useMemo to calculate groups based on dependencies

//   const groups = useMemo(() => {
//     const newGroups = [];
//     for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
//       for (let colIndex = 0; colIndex < cols; colIndex++) {
//         let cellShape = CellGen({
//           x: rowIndex,
//           y: colIndex,
//           cellWidth,
//           cellHeight,
//           modules,
//           toggleCellSelection,
//         });
//         newGroups.push(cellShape);
//       }
//     }
//     return newGroups;
//   }, [modules]); // Include modules in the dependency array
//   // rows, cols, cellWidth, cellHeight,
//   // useEffect to handle side effects, like updating the canvas
//   useEffect(() => {
//     const layer = modRef.current;
//     if (!layer) {
//       return;
//     }

//     // Clear existing content
//     // layer.clear();

//     // Add new groups to the layer
//     groups.forEach((group) => {
//       layer.add(group);
//       // setCells((prevCells) => {
//       //   const newCells = new Map(prevCells);
//       //   const key = `${group.x},${group.y}`;
//       //   newCells.set(key, group);
//       // });
//     });

//     // layer.add(cells);
//     // Redraw the layer to display the new content
//     // layer.draw();

//     // Cleanup function to remove all groups when the component unmounts or before re-running the effect
//     return () => {
//       groups.forEach((group) => {
//         group.remove();
//       });
//     };
//   }, [groups, modRef]); // Effect depends on groups and modRef

//   return null;
// }
