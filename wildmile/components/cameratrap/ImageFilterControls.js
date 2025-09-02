"use client";
import React, { useState, useEffect } from "react";
import { DateInput, DatePickerInput, TimeInput } from "@mantine/dates";
import {
  Select,
  Button,
  Group,
  Stack,
  Switch,
  ActionIcon,
  Drawer,
  Text,
  NumberInput,
} from "@mantine/core";
import {
  IconX,
  IconAdjustmentsHorizontal,
  IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

// Define a truly blank/empty state for filters for the "Clear All" functionality
const blankFiltersState = {
  locationId: null,
  startDate: null,
  endDate: null,
  startTime: "",
  endTime: "",
  reviewed: false,
  reviewedByUser: false,
  animalProbability: [0, 1], // Represents the full possible range, effectively "no filter"
};

export function ImageFilterControls({ onApplyFilters, initialFilters }) {
  const [opened, { open, close }] = useDisclosure(false);
  // Initialize filters with initialFilters if provided, otherwise fallback to blank.
  // initialFilters will come from ImageAnnotationPage, potentially with server defaults.
  const [filters, setFilters] = useState(initialFilters || blankFiltersState);

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  // Effect to update internal state if initialFilters prop changes after initial mount.
  // This handles cases where ImageAnnotationPage might update defaults and pass them down.
  useEffect(() => {
    if (initialFilters) {
      // Ensure date values are Date objects. ImageAnnotationPage should already do this,
      // but this adds robustness.
      const processedInitialFilters = {
        ...blankFiltersState, // Ensure all fields from blankFiltersState are present
        ...initialFilters,    // Override with provided initialFilters
        startDate: initialFilters.startDate ? new Date(initialFilters.startDate) : null,
        endDate: initialFilters.endDate ? new Date(initialFilters.endDate) : null,
        // Ensure animalProbability is a valid array or fallback
        animalProbability: Array.isArray(initialFilters.animalProbability) && initialFilters.animalProbability.length === 2
                            ? initialFilters.animalProbability
                            : blankFiltersState.animalProbability,
        startTime: initialFilters.startTime || "",
        endTime: initialFilters.endTime || "",

      };
      setFilters(processedInitialFilters);
    }
  }, [initialFilters]);

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        "/api/cameratrap/getDeploymentLocations?onlyUsed=true"
      );
      if (response.ok) {
        const data = await response.json();
        setLocations(
          data.map((l) => ({ value: l._id, label: l.locationName }))
        );
      } else {
        console.error("Failed to fetch locations");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    if (key !== "animalProbability") { // Only process if not animalProbability for now
      setFilters((prev) => ({ ...prev, [key]: value }));
    }
    // animalProbability will be handled by new dedicated functions for min/max inputs
  };

  const handleClearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  const handleClearAllFilters = () => {
    setFilters(blankFiltersState);
    // The behavior is that `onApplyFilters` will be called by the user clicking "Get Images"
    // or "Search Images" button after clearing. This will propagate the blankFiltersState.
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    close();
  };

  const hasActiveFilters = Object.values(filters).some(
    (value) => value !== null && value !== false
  );

  const handleTimeChange = (key, value) => {
    if (!value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
      handleFilterChange(key, value);
    }
  };

  return (
    <>
      <Group position="apart">
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
          variant={hasActiveFilters ? "filled" : "outline"}
          color={hasActiveFilters ? "yellow" : "grey"}
        >
          {hasActiveFilters ? "Filters Active" : "Filters"}
        </Button>
      </Group>

      <Drawer
        opened={opened}
        onClose={close}
        title="Image Filters"
        position="right"
        padding="lg"
      >
        <Stack spacing="md">
          <Text size="sm" color="dimmed" mb="md">
            Configure filters to narrow down your image search
          </Text>

          <Button onClick={handleApplyFilters}>Search Images</Button>

          <Group grow align="flex-start">
            <DateInput
              label="Start Date"
              placeholder="Select start date"
              value={filters.startDate}
              onChange={(value) => handleFilterChange("startDate", value)}
              rightSection={
                filters.startDate && (
                  <ActionIcon
                    onClick={() => handleClearFilter("startDate")}
                    size="sm"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                )
              }
            />

            <DateInput
              label="End Date"
              placeholder="Select end date"
              value={filters.endDate}
              onChange={(value) => handleFilterChange("endDate", value)}
              rightSection={
                filters.endDate && (
                  <ActionIcon
                    onClick={() => handleClearFilter("endDate")}
                    size="sm"
                  >
                    <IconX size={12} />
                  </ActionIcon>
                )
              }
            />
          </Group>

          <Group grow align="flex-start">
            <TimeInput
              label="Start Time"
              placeholder="Select start time"
              value={filters.startTime}
              onChange={(value) => handleTimeChange("startTime", value)}
              onBlur={(e) =>
                handleTimeChange("startTime", e.currentTarget.value)
              }
              rightSection={
                filters.startTime && (
                  <ActionIcon
                    onClick={() => handleClearFilter("startTime")}
                    size="sm"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                )
              }
            />

            <TimeInput
              label="End Time"
              placeholder="Select end time"
              value={filters.endTime}
              onChange={(value) => handleTimeChange("endTime", value)}
              onBlur={(e) => handleTimeChange("endTime", e.currentTarget.value)}
              rightSection={
                filters.endTime && (
                  <ActionIcon
                    onClick={() => handleClearFilter("endTime")}
                    size="sm"
                  >
                    <IconX size={14} />
                  </ActionIcon>
                )
              }
            />
          </Group>

          <Select
            label="Location"
            placeholder="Select a location"
            data={locations}
            value={filters.locationId}
            onChange={(value) => handleFilterChange("locationId", value)}
            rightSection={
              filters.locationId && (
                <ActionIcon
                  onClick={() => handleClearFilter("locationId")}
                  size="sm"
                >
                  <IconX size={14} />
                </ActionIcon>
              )
            }
          />

          <Switch
            label="Show only reviewed images"
            checked={filters.reviewed}
            onChange={(event) =>
              handleFilterChange("reviewed", event.currentTarget.checked)
            }
          />

          <Switch
            label="Show only images reviewed by me"
            checked={filters.reviewedByUser}
            onChange={(event) =>
              handleFilterChange("reviewedByUser", event.currentTarget.checked)
            }
          />
          <Group grow align="flex-start" mt="md">
            <NumberInput
              label="Min Animal %"
              placeholder="Enter min % (0-100)"
              value={Math.round(filters.animalProbability[0] * 100)}
              onChange={(value) => {
                const newMinDecimal = Math.max(0, Math.min(100, Number(value))) / 100;
                const currentMaxDecimal = filters.animalProbability[1];
                if (newMinDecimal <= currentMaxDecimal) {
                  setFilters(prev => ({ ...prev, animalProbability: [newMinDecimal, currentMaxDecimal] }));
                } else {
                  setFilters(prev => ({ ...prev, animalProbability: [currentMaxDecimal, currentMaxDecimal] }));
                }
              }}
              min={0}
              max={100}
              step={1}
            />
            <NumberInput
              label="Max Animal %"
              placeholder="Enter max % (0-100)"
              value={Math.round(filters.animalProbability[1] * 100)}
              onChange={(value) => {
                const newMaxDecimal = Math.max(0, Math.min(100, Number(value))) / 100;
                const currentMinDecimal = filters.animalProbability[0];
                if (newMaxDecimal >= currentMinDecimal) {
                  setFilters(prev => ({ ...prev, animalProbability: [currentMinDecimal, newMaxDecimal] }));
                } else {
                  setFilters(prev => ({ ...prev, animalProbability: [currentMinDecimal, currentMinDecimal] }));
                }
              }}
              min={0}
              max={100}
              step={1}
            />
          </Group>
          <Button
            variant="outline"
            color="gray"
            fullWidth
            mt="lg" // Add some margin top
            onClick={handleClearAllFilters}
          >
            Clear All Filters
          </Button>
        </Stack>
      </Drawer>
    </>
  );
}
