"use client";
import { AdvancedImageFilterControls } from "../AdvancedImageFilterControls";
import { Button, Group, Drawer } from "@mantine/core";
import { IconRefresh, IconAdjustmentsHorizontal } from "@tabler/icons-react";
import { useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import WildlifeSearch from "../WildlifeSearch";
import { useSelection } from "../ContextCamera";

export function GalleryFilter({ onFilterChange }) {
  const [opened, { toggle }] = useDisclosure(false);
  const [selection, setSelection] = useSelection();
  const handleApplyFilters = (filters) => {
    // if (onFilterChange) {
    if (selection.length > 0) {
      let wildlifeSelected = selection.map((animal) => animal.name);
      filters.species = wildlifeSelected;
    } else {
      filters.species = [];
    }
    const validParams = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (key === "reviewed" || key === "reviewedByUser") {
          acc[key] = value.toString();
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});
    onFilterChange(validParams);
    // }
  };

  return (
    <>
      {/* <Group position="apart">
        <Button
          size="md"
          onClick={handleApplyFilters}
          leftSection={<IconRefresh />}
        >
          Get Images
        </Button>
        <Button
          onClick={open}
          leftSection={<IconAdjustmentsHorizontal size={16} />}
          variant={hasActiveFilters ? "default" : "outline"}
          color="gray"
        >
          {hasActiveFilters ? "Filters Active" : "Filters"}
        </Button>
      </Group> */}

      <AdvancedImageFilterControls onApplyFilters={handleApplyFilters} />
      <WildlifeSearch />
    </>
  );
}
