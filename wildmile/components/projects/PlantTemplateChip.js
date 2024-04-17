"use client";
import { Badge, Chip, Text } from "@mantine/core";
import { useClientState } from "./context_mod_map";

// TODO: allow user to remove plant from selected by clicking on chip
export default function PlantTemplateChip({ plantId }) {
  const plantingTemplateOptions = useClientState("plantingTemplateOptions");
  if (!plantingTemplateOptions) {
    return null;
  }
  console.log("Planting Template Options: ", plantingTemplateOptions);

  const badges = plantingTemplateOptions.reduce((acc, option) => {
    if (option.plant === plantId) {
      const badge = (
        <Badge key={option.id} color={option.color}>
          {option.id}
        </Badge>
      );
      acc.push(badge);
    }
    return acc; // Return the accumulator for the next iteration
  }, []); // Initial value is an empty array

  return <>{badges}</>;
}
