"use client";
import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { Paper, Group, Chip, Select } from "@mantine/core";
import { getPlantingTemplate } from "app/actions/ResourceActions";
import { useClient } from "./context_mod_map";
import ColorSelectionButtons from "./ColorSelectionButtons";
import { use } from "passport";
const selectionColors = {
  1: { color: "blue", id: 1 },
  2: { color: "yellow", id: 2 },
  3: { color: "green", id: 3 },
  4: { color: "grape", id: 4 },
  5: { color: "red", id: 5 },
  6: { color: "cyan", id: 6 },
  7: { color: "pink", id: 7 },
};

const GridSquare = ({ x, y, size, color }) => (
  <Rect
    x={x * size}
    y={y * size}
    width={size}
    height={size}
    fill={color || "grey"}
    stroke="black"
  />
);

export const PlantingTemplate = () => {
  const { dispatch } = useClient();
  const gridSize = { width: 4, height: 10 };
  const squareSize = 40;
  const [selection, setSelection] = useState("1");
  const [selectedCells, setSelectedCells] = useState(new Map());
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [uniqueColors, setUniqueColors] = useState(null);

  useEffect(() => {
    const newColors = new Set(); // Create a new set to hold unique colors with IDs

    // Traverse through the selectedTemplate data to find unique colors with their IDs
    Object.values(selectedTemplate?.data || {}).forEach((cell) => {
      // Check each cell for a color and ensure it isn't already added
      if (
        cell.color &&
        !Array.from(newColors).some((c) => c.color === cell.color)
      ) {
        const colorEntry = Object.values(selectionColors).find(
          (c) => c.color === cell.color
        );
        if (colorEntry) {
          newColors.add({ color: cell.color, id: colorEntry.id }); // Store the color and the ID
        }
      }
    });

    setUniqueColors(Array.from(newColors)); // Convert the set to an array and update the state
  }, [selectedTemplate]); // This effect runs whenever selectedTemplate changes

  //   useEffect(() => {
  //     const newColors = new Set();
  //     Object.values(selectedTemplate?.data || {}).forEach((cell) => {
  //       if (cell.color && !newColors.has(cell.color)) {
  //         newColors.add(cell.color);
  //       }
  //     });
  //     setUniqueColors([...newColors]);
  //   }, [selectedTemplate]);

  useEffect(() => {
    async function fetchTemplates() {
      const res = await getPlantingTemplate();
      const parsedTemplates = JSON.parse(res);
      console.log("Fetched Templates:", parsedTemplates); // Debugging log
      setTemplates(
        parsedTemplates.map((t) => ({
          value: t._id,
          label: t.metadata.title,
          data: t.data, // Make sure the data is being included
        }))
      );
    }
    fetchTemplates();
  }, []);
  useEffect(() => {
    if (selectedTemplate) {
      console.log("Selected Template:", selectedTemplate); // Debugging log
      const newCells = new Map();
      // Safely access the data property with optional chaining
      Object.entries(selectedTemplate?.data ?? {}).forEach(
        ([key, { color, id, x, y }]) => {
          if (color && id && x != null && y != null) {
            // Ensure all needed properties are present
            newCells.set(key, { id, color, x, y });
          }
        }
      );
      setSelectedCells(newCells);
      dispatch({ type: "SET_SELECTED_TEMPLATE", payload: newCells });
    }
  }, [selectedTemplate]);

  useEffect(() => {
    dispatch({ type: "ADD_PLANT_TO_TEMPLATE", payload: selectedColor });
  }, [selectedColor]);
  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t.value === templateId);
    setSelectedTemplate(template);
  };

  const squares = [];
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const key = `${x},${y}`;
      const cell = selectedCells.get(key);
      const color = cell ? cell.color || "grey" : "grey";

      squares.push(
        <GridSquare key={key} x={x} y={y} size={squareSize} color={color} />
      );
    }
  }

  return (
    <>
      <Paper padding="md" shadow="xs" radius="md">
        <Select
          data={templates}
          placeholder="Select a template"
          onChange={handleTemplateChange}
        />
        <Stage
          width={gridSize.width * squareSize}
          height={gridSize.height * squareSize}
        >
          <Layer>{squares}</Layer>
        </Stage>
        (selectedTemplate){" "}
        {
          <ColorSelectionButtons
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            uniqueColors={uniqueColors}
          />
        }
      </Paper>
    </>
  );
};

export default PlantingTemplate;

// import React, { useState, useRef, useEffect } from "react";
// import { Stage, Layer, Rect } from "react-konva";
// // import { createPlantingTemplate } from "lib/db/resources";

// import {
//   Button,
//   Group,
//   SegmentedControl,
//   Chip,
//   darken,
//   lighten,
//   getThemeColor,
//   useMantineTheme,
//   Paper,
//   Column,
//   TextInput, // Added TextInput component
//   Select,
// } from "@mantine/core";
// import { useClient, useClientState } from "./context_mod_map";
// import { getPlantingTemplate } from "app/actions/ResourceActions";
// import { set } from "mongoose";
// import { use } from "passport";

// export const selectionColors = {
//   1: { color: "blue", id: 1 },
//   2: { color: "yellow", id: 2 },
//   3: { color: "green", id: 3 },
//   4: { color: "grape", id: 4 },
//   5: { color: "red", id: 5 },
//   6: { color: "cyan", id: 6 },
//   7: { color: "pink", id: 7 },
//   // Add more if needed
// };

// function GetColor(color) {
//   const theme = useMantineTheme();
//   const useColor =
//     typeof color === "string"
//       ? theme.colors[color][6] || theme.colors.grey[5]
//       : undefined;
//   return useColor;
// }
// const GridSquare = ({ x, y, size, onSquareClick, color }) => {
//   return (
//     <Rect
//       x={x * size}
//       y={y * size}
//       width={size}
//       height={size}
//       fill={color || "grey"}
//       stroke="black"
//       onClick={() => onSquareClick(x, y)}
//     />
//   );
// };
// export const data = async (setSelectTemplate) => {
//   const { dispatch } = useClient();

//   const res = await getPlantingTemplate();
//   //   setPlantingTemplate(res);
//   const templates = [];
//   const templateSet = {}; // Change from [] to {}
//   console.log("Data:", res);
//   const raw_templates = JSON.parse(res);
//   for (let i = 0; i < raw_templates.length; i++) {
//     templates.push({
//       value: raw_templates[i]["_id"],
//       label: raw_templates[i]["metadata"]["title"],
//     });
//     templateSet[raw_templates[i]["_id"]] = raw_templates[i]; // Change to object assignment
//   }
//   //   dispatch({ type: "SET_PLANTING_TEMPLATES", payload: templateSet });
//   return <Select data={templates} onChange={setSelectTemplate} />;
// };
// export const PlantingTemplate = () => {
//   const gridSize = { width: 4, height: 10 };
//   const squareSize = 40; // Each square is 40x40 pixels
//   const [selection, setSelection] = useState("1"); // Default selection
//   const [selectedCells, setSelectedCells] = useState(new Map()); //{"1,3" => "pink"}
//   const [isSubmitted, setIsSubmitted] = useState(false);
//   const [plantingTemplate, setPlantingTemplate] = useState(null);
//   const [selectTemplate, setSelectTemplate] = useState(null);

//   const initialValues = {
//     // Added missing const keyword
//     description: "",
//     name: "",
//     planting_template: null,
//   };

//   const handleSquareClick = (x, y) => {
//     const key = `${x},${y}`;
//     setSelectedCells((prevCells) => {
//       const newCells = new Map(prevCells);
//       if (newCells.get(key)) {
//         newCells.delete(key);
//       } else {
//         newCells.set(key, { ...selectionColors[selection], x, y });
//       }
//       return newCells;
//     });
//   };

//   const squares = [];
//   for (let y = 0; y < gridSize.height; y++) {
//     for (let x = 0; x < gridSize.width; x++) {
//       const key = `${x},${y}`;
//       const cell = selectedCells.get(key);
//       const color = cell ? cell.color : undefined;
//       //   const color = GetColor(raw_color);
//       squares.push(
//         <GridSquare
//           key={key}
//           x={x}
//           y={y}
//           size={squareSize}
//           onSquareClick={handleSquareClick}
//           color={color}
//         />
//       );
//     }
//   }

//   return (
//     <>
//       <Paper padding="md" shadow="xs" radius="md">
//         {data(setSelectTemplate)}
//         <Group>
//           <Chip.Group value={selection} onChange={setSelection}>
//             <Group justify="center">
//               <div style={{ display: "flex", flexDirection: "row" }}>
//                 {Object.entries(selectionColors).map(([value, item]) => (
//                   <Chip
//                     key={value}
//                     value={value}
//                     color={item.color} // This sets the text color and border color for the chip
//                     styles={(theme) => ({
//                       root: {
//                         backgroundColor:
//                           selection === value
//                             ? theme.colors[item.color][6]
//                             : theme.colors[item.color][2],
//                         "&:hover": {
//                           backgroundColor: theme.colors[item.color][5],
//                         },
//                       },
//                     })}
//                   >
//                     {value}
//                   </Chip>
//                 ))}
//               </div>
//             </Group>
//           </Chip.Group>
//         </Group>
//         <Group>
//           <Stage
//             width={gridSize.width * squareSize}
//             height={gridSize.height * squareSize}
//           >
//             <Layer>{squares}</Layer>
//           </Stage>
//         </Group>
//       </Paper>
//     </>
//   );
// };

// export default PlantingTemplate;
