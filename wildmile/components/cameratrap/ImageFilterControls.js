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
} from "@mantine/core";
import {
  IconX,
  IconAdjustmentsHorizontal,
  IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

export function ImageFilterControls({ onApplyFilters }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [filters, setFilters] = useState({
    locationId: null,
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    reviewed: false,
    reviewedByUser: false,
  });

  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

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
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleClearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      locationId: null,
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      reviewed: false,
      reviewedByUser: false,
    });
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
        </Stack>
      </Drawer>
    </>
  );
}
