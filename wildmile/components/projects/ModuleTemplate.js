import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import { createPlantingTemplate } from "lib/db/resources";

import {
  Button,
  Group,
  SegmentedControl,
  Chip,
  darken,
  lighten,
  getThemeColor,
  useMantineTheme,
  Paper,
  Column,
  TextInput, // Added TextInput component
} from "@mantine/core";
import { useForm } from "@mantine/form";

export const selectionColors = {
  1: { color: "blue", id: 1 },
  2: { color: "yellow", id: 2 },
  3: { color: "green", id: 3 },
  4: { color: "grape", id: 4 },
  5: { color: "red", id: 5 },
  6: { color: "cyan", id: 6 },
  7: { color: "pink", id: 7 },
  // Add more if needed
};

function GetColor(color) {
  const theme = useMantineTheme();
  const useColor =
    typeof color === "string"
      ? theme.colors[color][6] || theme.colors.grey[5]
      : undefined;
  return useColor;
}
const GridSquare = ({ x, y, size, onSquareClick, color }) => {
  return (
    <Rect
      x={x * size}
      y={y * size}
      width={size}
      height={size}
      fill={color || "grey"}
      stroke="black"
      onClick={() => onSquareClick(x, y)}
    />
  );
};

export const KonvaGrid = () => {
  const gridSize = { width: 4, height: 10 };
  const squareSize = 40; // Each square is 40x40 pixels
  const [selection, setSelection] = useState("1"); // Default selection
  const [selectedCells, setSelectedCells] = useState(new Map()); //{"1,3" => "pink"}
  const [isSubmitted, setIsSubmitted] = useState(false);

  const initialValues = {
    // Added missing const keyword
    description: "",
    name: "",
    planting_template: null,
  };

  const form = useForm({
    initialValues,
  });

  async function submitForm() {
    if (form.isSubmitting) {
      return; // Prevent multiple submissions
    }

    try {
      const name = form.values.name; // Get the name from the form values
      const description = form.values.description; // Get the description from the form values
      const planting_template = selectedCells;
      const rawResult = await createPlantingTemplate({
        ...form.values,
        planting_template,
      });
      const result = await JSON.parse(rawResult);
      console.log("Result:", result);

      if (result.success === true) {
        console.log("success");
        setIsSubmitted(true); // Set isSubmitted to true
        return result;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle the error as needed
    }
  }

  console.log("Selected Cells:", selectedCells);
  // Function to lighten the color
  const lightenColor = (color, amount) => {
    return lighten(color, amount);
  };
  const handleSquareClick = (x, y) => {
    const key = `${x},${y}`;
    setSelectedCells((prevCells) => {
      const newCells = new Map(prevCells);
      if (newCells.get(key)) {
        newCells.delete(key);
      } else {
        newCells.set(key, { ...selectionColors[selection], x, y });
      }
      return newCells;
    });
  };

  const squares = [];
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const key = `${x},${y}`;
      const cell = selectedCells.get(key);
      const color = cell ? cell.color : undefined;
      //   const color = GetColor(raw_color);
      squares.push(
        <GridSquare
          key={key}
          x={x}
          y={y}
          size={squareSize}
          onSquareClick={handleSquareClick}
          color={color}
        />
      );
    }
  }

  return (
    <>
      <Paper padding="md" shadow="xs" radius="md">
        <Group>
          <Button
            color="yellow"
            onClick={() => {
              setSelectedCell(new Map());
              console.log("Selected Cells:", selectedCell);
            }}
          >
            Clear Selection
          </Button>

          <Button
            type="submit"
            justify="right"
            onClick={submitForm}
            disabled={form.isSubmitting}
            style={{ backgroundColor: isSubmitted ? "green" : undefined }}
          >
            Save
          </Button>
          <TextInput // Added TextInput component for name
            label="Name"
            value={form.values.name}
            onChange={(event) => form.setFieldValue("name", event.target.value)}
          />
          <TextInput // Added TextInput component for description
            label="Description"
            value={form.values.description}
            onChange={(event) =>
              form.setFieldValue("description", event.target.value)
            }
          />
        </Group>
        <Group>
          <Chip.Group value={selection} onChange={setSelection}>
            <Group justify="center">
              <div style={{ display: "flex", flexDirection: "row" }}>
                {Object.entries(selectionColors).map(([value, item]) => (
                  <Chip
                    key={value}
                    value={value}
                    color={item.color} // This sets the text color and border color for the chip
                    styles={(theme) => ({
                      root: {
                        backgroundColor:
                          selection === value
                            ? theme.colors[item.color][6]
                            : theme.colors[item.color][2],
                        "&:hover": {
                          backgroundColor: theme.colors[item.color][5],
                        },
                      },
                    })}
                  >
                    {value}
                  </Chip>
                ))}
              </div>
            </Group>
          </Chip.Group>
        </Group>
        <Group>
          <Stage
            width={gridSize.width * squareSize}
            height={gridSize.height * squareSize}
          >
            <Layer>{squares}</Layer>
          </Stage>
        </Group>
      </Paper>
    </>
  );
};

export default KonvaGrid;
