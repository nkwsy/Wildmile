"use client";
import React, { useState } from "react";

import { DatePickerInput } from "@mantine/dates";
import { Select, Button, Group, Stack, Switch } from "@mantine/core";

export function ImageFilterControls({ onApplyFilters, deployments }) {
  const [filters, setFilters] = useState({
    deploymentId: null,
    startDate: null,
    endDate: null,
    reviewed: false,
    reviewedByUser: false,
  });

  const [changedFilters, setChangedFilters] = useState({});

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setChangedFilters((prev) => ({ ...prev, [key]: true }));
  };

  const handleApplyFilters = () => {
    const appliedFilters = Object.keys(changedFilters).reduce((acc, key) => {
      acc[key] = filters[key];
      return acc;
    }, {});
    onApplyFilters(appliedFilters);
  };

  return (
    <Stack spacing="md">
      {/* <Select
        label="Deployment"
        placeholder="Select deployment"
        data={deployments}
        value={filters.deploymentId}
        onChange={(value) => handleFilterChange("deploymentId", value)}
      /> */}
      <Group grow>
        <DatePickerInput
          label="Start Date"
          placeholder="Pick start date"
          value={filters.startDate}
          onChange={(value) => handleFilterChange("startDate", value)}
        />
        <DatePickerInput
          label="End Date"
          placeholder="Pick end date"
          value={filters.endDate}
          onChange={(value) => handleFilterChange("endDate", value)}
        />
      </Group>
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
