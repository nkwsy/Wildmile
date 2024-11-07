"use client";
import React, { useState, useEffect } from "react";
import { DateInput, TimeInput } from "@mantine/dates";
import {
  Select,
  Button,
  Group,
  Stack,
  Switch,
  ActionIcon,
  Drawer,
  Text,
  MultiSelect,
  SegmentedControl,
  TextInput,
} from "@mantine/core";
import {
  IconX,
  IconAdjustmentsHorizontal,
  IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import TaxaSearch from "./TaxaSearch";

export function AdvancedImageFilterControls({ onApplyFilters }) {
  const [opened, { open, close }] = useDisclosure(false);
  const [filters, setFilters] = useState({
    locationId: null,
    deploymentId: null,
    startDate: null,
    endDate: null,
    startTime: null,
    endTime: null,
    reviewed: false,
    reviewedByUser: false,
    userFavorite: false,
    favorites: false,
    type: null,
    consensusStatus: null,
    species: [],
    accepted: false,
    sort: "timestamp",
    sortDirection: "desc",
  });

  const [locations, setLocations] = useState([]);
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (filters.locationId) {
      fetchDeployments(filters.locationId);
    }
  }, [filters.locationId]);

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
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const fetchDeployments = async (locationId) => {
    try {
      const response = await fetch(
        `/api/cameratrap/deployments?locationId=${locationId}`
      );
      if (response.ok) {
        const data = await response.json();
        setDeployments(
          data.map((d) => ({
            value: d._id,
            label: `Deployment ${new Date(
              d.deploymentStart
            ).toLocaleDateString()}`,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleSpeciesSelect = (species) => {
    setFilters((prev) => ({
      ...prev,
      species: species.map((s) => s.scientificName),
    }));
  };

  const handleClearFilter = (key) => {
    setFilters((prev) => ({ ...prev, [key]: null }));
  };

  const handleClearAllFilters = () => {
    setFilters({
      locationId: null,
      deploymentId: null,
      startDate: null,
      endDate: null,
      startTime: null,
      endTime: null,
      reviewed: false,
      reviewedByUser: false,
      userFavorite: false,
      type: null,
      consensusStatus: null,
      species: [],
      accepted: false,
      sort: "timestamp",
      sortDirection: "desc",
    });
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
    close();
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    return value !== null;
  });

  const handleTimeChange = (field, value) => {
    // Value comes in as a string in "HH:mm" format or null
    handleFilterChange(field, value);
  };

  return (
    <>
      <Stack spacing="md">
        <Button onClick={handleApplyFilters}>Apply Filters</Button>

        <Select
          label="Location"
          placeholder="Select a location"
          data={locations}
          value={filters.locationId}
          onChange={(value) => handleFilterChange("locationId", value)}
          clearable
        />

        {filters.locationId && (
          <Select
            label="Deployment"
            placeholder="Select a deployment"
            data={deployments}
            value={filters.deploymentId}
            onChange={(value) => handleFilterChange("deploymentId", value)}
            clearable
          />
        )}

        {/* <TaxaSearch onSpeciesSelect={handleSpeciesSelect} /> */}

        <SegmentedControl
          data={[
            { label: "All", value: "" },
            { label: "Animals", value: "animals" },
            { label: "Humans", value: "humans" },
          ]}
          value={filters.type || ""}
          onChange={(value) => handleFilterChange("type", value)}
        />

        <Select
          label="Consensus Status"
          placeholder="Select status"
          data={[
            { label: "Pending", value: "Pending" },
            { label: "Consensus Reached", value: "ConsensusReached" },
            {
              label: "More Annotations Needed",
              value: "MoreAnnotationsNeeded",
            },
          ]}
          value={filters.consensusStatus}
          onChange={(value) => handleFilterChange("consensusStatus", value)}
          clearable
        />

        <Group grow align="flex-start">
          <DateInput
            label="Start Date"
            value={filters.startDate}
            onChange={(value) => handleFilterChange("startDate", value)}
            clearable
          />
          <DateInput
            label="End Date"
            value={filters.endDate}
            onChange={(value) => handleFilterChange("endDate", value)}
            clearable
          />
        </Group>

        <Group grow align="flex-start">
          <TextInput
            type="time"
            label="Start Time"
            value={filters.startTime || ""}
            onChange={(e) => handleFilterChange("startTime", e.target.value)}
          />
          <TextInput
            type="time"
            label="End Time"
            value={filters.endTime || ""}
            onChange={(e) => handleFilterChange("endTime", e.target.value)}
          />
        </Group>

        <Stack spacing="xs">
          <Switch
            label="Show only reviewed images"
            checked={filters.reviewed}
            onChange={(e) =>
              handleFilterChange("reviewed", e.currentTarget.checked)
            }
          />
          <Switch
            label="Show only images reviewed by me"
            checked={filters.reviewedByUser}
            onChange={(e) =>
              handleFilterChange("reviewedByUser", e.currentTarget.checked)
            }
          />
          <Switch
            label="Show only my favorites"
            checked={filters.userFavorite}
            onChange={(e) =>
              handleFilterChange("userFavorite", e.currentTarget.checked)
            }
          />
          <Switch
            label="Show Favorites"
            checked={filters.favorites}
            onChange={(e) =>
              handleFilterChange("favorites", e.currentTarget.checked)
            }
          />
          <Switch
            label="Show only accepted images"
            checked={filters.accepted}
            onChange={(e) =>
              handleFilterChange("accepted", e.currentTarget.checked)
            }
          />
        </Stack>

        <Select
          label="Sort By"
          data={[
            { label: "Date (Newest)", value: "timestamp-desc" },
            { label: "Date (Oldest)", value: "timestamp-asc" },
            { label: "Most Reviewed", value: "reviewCount-desc" },
            { label: "Most Favorites", value: "favoriteCount-desc" },
          ]}
          value={`${filters.sort}-${filters.sortDirection}`}
          onChange={(value) => {
            const [sort, direction] = value.split("-");
            handleFilterChange("sort", sort);
            handleFilterChange("sortDirection", direction);
          }}
        />

        <Button variant="subtle" color="gray" onClick={handleClearAllFilters}>
          Clear All Filters
        </Button>
      </Stack>
    </>
  );
}
