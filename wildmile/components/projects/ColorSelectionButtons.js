import React from "react";
import { Button, Group } from "@mantine/core";

// Updated to handle an array of {color, id} objects
function ColorSelectionButtons({
  selectedColor,
  setSelectedColor,
  uniqueColors,
}) {
  // Toggle color selection, can be adjusted to toggle by ID or color
  const toggleColorSelection = (colorInfo) => {
    setSelectedColor(colorInfo);
    // setSelectedColor((current) =>
    // current?.color === colorInfo.color ? null : colorInfo
    // );
  };

  if (!uniqueColors || uniqueColors.length === 0) {
    return null; // Return null if no colors are available
  }

  return (
    <Group position="center">
      {uniqueColors.map(
        (
          { color, id } // Destructure each color object
        ) => (
          <Button
            key={id} // Use ID for key for better React performance
            color={color ? color : "gray"} // Check if this color is selected
            onClick={() => toggleColorSelection({ color, id })} // Pass color info to the click handler
            variant={selectedColor?.color === color ? "" : "light"}
          >
            {id}
          </Button>
        )
      )}
    </Group>
  );
}

export default ColorSelectionButtons;
