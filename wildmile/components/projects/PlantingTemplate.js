"use client";
import React, { useState, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { Paper, Group, Chip, Select, Button } from "@mantine/core";
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
          newColors.add({ color: cell.color, id: colorEntry.id, plant: null }); // Store the color and the ID
        }
      }
    });
    setUniqueColors(Array.from(newColors)); // Convert the set to an array and update the state
    dispatch({
      type: "SET_PLANT_TEMPLATE_OPTIONS",
      payload: Array.from(newColors),
    });
  }, [selectedTemplate]); // This effect runs whenever selectedTemplate changes

  // initial fetching of all the templates
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

  // update cells if template is selected
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
      dispatch({ type: "SET_PLANTING_TEMPLATE", payload: newCells });
      dispatch({ type: "MOD_LAYER_SELECTABLE", payload: true });
    }
    if (!selectedTemplate) {
      setSelectedCells(new Map());
      dispatch({ type: "SET_PLANTING_TEMPLATE", payload: new Map() });
      dispatch({ type: "MOD_LAYER_SELECTABLE", payload: false });
    }
  }, [selectedTemplate]);

  useEffect(() => {
    dispatch({ type: "ADD_PLANT_TO_TEMPLATE", payload: selectedColor });
  }, [selectedColor]);

  // function to change the template via select
  const handleTemplateChange = (templateId) => {
    const template = templates.find((t) => t.value === templateId);
    setSelectedTemplate(template);
  };
  const UseTemplateOnModules = () => {
    dispatch({ type: "MOD_LAYER_SELECTABLE", payload: true });
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
          clearable
        />
        {selectedTemplate && (
          <Stage
            width={gridSize.width * squareSize}
            height={gridSize.height * squareSize}
          >
            <Layer>{squares}</Layer>
          </Stage>
        )}
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
