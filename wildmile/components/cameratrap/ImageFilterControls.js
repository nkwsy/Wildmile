"use client";
import React, { useState, useEffect } from "react";

import { DatePickerInput } from "@mantine/dates";
import {
  Select,
  Button,
  Group,
  Stack,
  Switch,
  ActionIcon,
} from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export function ImageFilterControls({ onApplyFilters }) {
  const [filters, setFilters] = useState({
    locationId: null,
    startDate: null,
    endDate: null,
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
      reviewed: false,
      reviewedByUser: false,
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <Stack spacing="md">
      <Group align="flex-end">
        <Select
          label="Location (optional)"
          placeholder="Select a location"
          data={locations}
          value={filters.locationId}
          onChange={(value) => handleFilterChange("locationId", value)}
          clearable
          style={{ flex: 1 }}
        />
        <ActionIcon
          onClick={() => handleClearFilter("locationId")}
          disabled={!filters.locationId}
        >
          <IconX size={16} />
        </ActionIcon>

        <DatePickerInput
          label="Start Date (optional)"
          placeholder="Select start date"
          value={filters.startDate}
          onChange={(value) => handleFilterChange("startDate", value)}
          style={{ flex: 1 }}
        />
        <ActionIcon
          onClick={() => handleClearFilter("startDate")}
          disabled={!filters.startDate}
        >
          <IconX size={16} />
        </ActionIcon>

        <DatePickerInput
          label="End Date (optional)"
          placeholder="Select end date"
          value={filters.endDate}
          onChange={(value) => handleFilterChange("endDate", value)}
          style={{ flex: 1 }}
        />
        <ActionIcon
          onClick={() => handleClearFilter("endDate")}
          disabled={!filters.endDate}
        >
          <IconX size={16} />
        </ActionIcon>
      </Group>
      <Switch
        label="Show only reviewed images"
        checked={filters.reviewed}
        onChange={(event) =>
          handleFilterChange("reviewed", event.currentTarget.checked)
        }
      />
      {/* // TODO: Implement filter to show images a user has reviewed */}
      {/* <Switch
        label="Show only images reviewed by me"
        checked={filters.reviewedByUser}
        onChange={(event) =>
          handleFilterChange("reviewedByUser", event.currentTarget.checked)
        }
      /> */}
      <Group position="apart">
        <Button onClick={handleApplyFilters}>Search Images</Button>
        <Button variant="outline" onClick={handleClearAllFilters}>
          Clear All Filters
        </Button>
      </Group>
    </Stack>
  );
}
