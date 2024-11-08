"use client";
import { AdvancedImageFilterControls } from "../AdvancedImageFilterControls";
import { Button, Group, Drawer, Stack, Collapse } from "@mantine/core";
import {
  IconRefresh,
  IconAdjustmentsHorizontal,
  IconPaw,
} from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { useDisclosure } from "@mantine/hooks";
import WildlifeSearch from "../WildlifeSearch";
import { useSelection } from "../ContextCamera";

export function GalleryFilter({ onFilterChange }) {
  const [opened, { toggle }] = useDisclosure(true);
  const [selection, setSelection] = useSelection();
  const [minimized, { toggle: toggleMinimized }] = useDisclosure(true);

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

  const handleClearFilters = () => {
    setSelection([]);
  };
  // useEffect(() => {
  //   if (opened) {
  //     setMinimized(false);
  //   } else {
  //     setMinimized(true);
  //   }
  // }, [opened]);
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
      <Group justify="flex-start" mb={5}>
        <Button
          onClick={toggle}
          variant="subtle"
          color="yellow"
          leftSection={<IconPaw size={16} />}
        >
          {opened ? "Hide Wildlife" : "Show Wildlife"}
        </Button>

        <Button
          onClick={toggleMinimized}
          variant="outline"
          color="yellow"
          leftSection={<IconAdjustmentsHorizontal size={16} />}
        >
          {minimized ? "Hide Filters" : "Show Filters"}
        </Button>
      </Group>
      <AdvancedImageFilterControls
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        onMinimize={minimized}
      />

      <Collapse in={opened}>
        <WildlifeSearch />
      </Collapse>
    </>
  );
}
