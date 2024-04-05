import React, { useState, useRef, useEffect } from "react";
import { Stage, Layer, Rect } from "react-konva";
import {
  Button,
  Group,
  SegmentedControl,
  Chip,
  darken,
  lighten,
  getThemeColor,
  useMantineTheme,
} from "@mantine/core";

export const selectionColors = {
  1: "blue",
  2: "yellow",
  3: "green",
  4: "grape",
  5: "cyan",
  6: "red",
  7: "pink",
  // Add more if needed
};

function GetColor(color) {
  const theme = useMantineTheme();
  const useColor = color || "lightblue";
  return getThemeColor(useColor, theme);
}

const GridSquare = ({ x, y, size, onSquareClick, color }) => {
  return (
    <Rect
      x={x * size}
      y={y * size}
      width={size}
      height={size}
      fill={color || "lightblue"}
      stroke="black"
      onClick={() => onSquareClick(x, y)}
    />
  );
};

export const KonvaGrid = () => {
  const gridSize = { width: 4, height: 10 };
  const squareSize = 40; // Each square is 40x40 pixels
  const [selection, setSelection] = useState("1"); // Default selection
  const [selectedCells, setSelectedCells] = useState(new Map());

  // Function to lighten the color
  const lightenColor = (color, amount) => {
    return lighten(color, amount);
  };
  const handleSquareClick = (x, y) => {
    const key = `${x},${y}`;
    setSelectedCells((prevCells) => {
      const newCells = new Map(prevCells);
      newCells.set(key, selectionColors[selection]);
      return newCells;
    });
  };

  const squares = [];
  for (let y = 0; y < gridSize.height; y++) {
    for (let x = 0; x < gridSize.width; x++) {
      const key = `${x},${y}`;
      const color = selectedCells.get(key);
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
      <Group>
        <Chip.Group value={selection} onChange={setSelection}>
          <Group justify="center">
            {Object.entries(selectionColors).map(([value, color]) => (
              <Chip
                key={value}
                value={value}
                color={color} // This sets the text color and border color for the chip
                styles={(theme) => ({
                  root: {
                    backgroundColor:
                      selection === value
                        ? theme.colors[color][6]
                        : theme.colors[color][2],
                    "&:hover": {
                      backgroundColor: theme.colors[color][5],
                    },
                  },
                })}
              >
                {value}
              </Chip>
            ))}
          </Group>
        </Chip.Group>
        <Button
          onClick={() => {
            setSelectedCell(new Set());
            console.log("Selected Cells:", selectedCell);
          }}
        >
          Clear Selection
        </Button>
        <Button
          onClick={() => {
            console.log("Selected Cells:", selectedCell);
          }}
        >
          Log Selection
        </Button>
      </Group>
      <Group>
        <Stage
          width={gridSize.width * squareSize}
          height={gridSize.height * squareSize}
        >
          <Layer>{squares}</Layer>
        </Stage>
      </Group>
    </>
  );
};

export default KonvaGrid;
