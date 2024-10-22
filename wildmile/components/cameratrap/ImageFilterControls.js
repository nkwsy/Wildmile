"use client";
import React, { useState, useEffect } from "react";

import { DatePickerInput } from "@mantine/dates";
import { Select, Button, Group, Stack, Switch } from "@mantine/core";

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

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  return (
    <Stack spacing="md">
      <Select
        label="Location"
        placeholder="Select a location"
        data={locations}
        value={filters.locationId}
        onChange={(value) => handleFilterChange("locationId", value)}
        clearable
      />
      <DatePickerInput
        label="Start Date"
        placeholder="Select start date"
        value={filters.startDate}
        onChange={(value) => handleFilterChange("startDate", value)}
      />
      <DatePickerInput
        label="End Date"
        placeholder="Select end date"
        value={filters.endDate}
        onChange={(value) => handleFilterChange("endDate", value)}
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
      <Button onClick={handleApplyFilters}>Apply Filters</Button>
    </Stack>
  );
}
