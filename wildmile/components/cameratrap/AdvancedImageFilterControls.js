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
  Grid,
  Collapse,
} from "@mantine/core";
import {
  IconX,
  IconAdjustmentsHorizontal,
  IconRefresh,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import TaxaSearch from "./TaxaSearch";
import styles from "styles/components/YesNoButtonGroup.module.css";
import { DeploymentMapPopover } from "./deployments/DeploymentMap";

// Default filter state — used on initial render and when clearing all filters.
const DEFAULT_FILTERS = {
  locationId: null,
  deploymentId: null,
  startDate: null,
  endDate: null,
  startTime: null,
  endTime: null,
  reviewed: null,
  reviewedByUser: null,
  userFavorite: null,
  favorites: null,
  type: null,
  consensusStatus: null,
  species: [],
  accepted: null,
  needsReview: null,
  sort: "timestamp",
  sortDirection: "desc",
};

/**
 * Advanced filter controls for the cameratrap image gallery.
 *
 * @param {Function} onApplyFilters - called whenever filters change, receives the full filter object
 * @param {Function} onClearFilters - called when user clicks "Clear All Filters"
 * @param {boolean}  onMinimize     - controls whether the filter panel is expanded
 * @param {Object}   initialFilters - filter values parsed from URL params on page load.
 *                   Merged into DEFAULT_FILTERS so the UI reflects any bookmarked/shared filter state.
 */
export function AdvancedImageFilterControls({
  onApplyFilters,
  onClearFilters,
  onMinimize,
  initialFilters = {},
}) {
  const [opened, { open, close }] = useDisclosure(false);

  // Merge URL-derived initial filters into the defaults.
  // This means if someone visits a URL like ?type=animals&locationId=abc,
  // those controls will already be set when the page loads.
  const [filters, setFilters] = useState({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  const [locations, setLocations] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  // When a location is picked from the map popover, update the filter
  useEffect(() => {
    if (selectedLocation) {
      handleFilterChange("locationId", selectedLocation._id);
    }
  }, [selectedLocation]);

  // Fetch the list of available locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // When locationId changes, fetch that location's deployments
  useEffect(() => {
    if (filters.locationId) {
      fetchDeployments(filters.locationId);
    }
  }, [filters.locationId]);

  // Auto-apply filters whenever any filter value changes.
  // This triggers the parent to update URL params and re-fetch images.
  useEffect(() => {
    handleApplyFilters();
  }, [filters]);

  const fetchLocations = async () => {
    try {
      const response = await fetch(
        "/api/cameratrap/getDeploymentLocations?onlyUsed=true",
        { next: { tags: ["locations"] } }
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
        `/api/cameratrap/deployments?locationId=${locationId}`,
        { next: { tags: ["deployments"] } }
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

  // Update a single filter key, triggering the useEffect above
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

  // Reset all filters back to defaults and notify parent
  const handleClearAllFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const handleApplyFilters = () => {
    onApplyFilters(filters);
  };

  const hasActiveFilters = Object.entries(filters).some(([key, value]) => {
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === "boolean") return value;
    return value !== null;
  });

  const handleTimeChange = (field, value) => {
    handleFilterChange(field, value);
  };

  return (
    <>
      <Stack spacing="md">
        <Group justify="flex-start" grow>
          <Button onClick={handleApplyFilters}>Apply Filters</Button>
          <Button variant="subtle" color="gray" onClick={handleClearAllFilters}>
            Clear All Filters
          </Button>
        </Group>
        <Collapse in={onMinimize}>
          <Group grow>
            <SegmentedControl
              data={[
                { label: "All", value: "" },
                { label: "Animals", value: "animals" },
                { label: "Humans", value: "humans" },
              ]}
              value={filters.type || ""}
              onChange={(value) => handleFilterChange("type", value)}
            />
          </Group>
          <Group grow>
            <div>
              <Select
                label="Location"
                placeholder="Select a location"
                data={locations}
                value={filters.locationId}
                onChange={(value) => handleFilterChange("locationId", value)}
                clearable
              />
              <DeploymentMapPopover handleFilterChange={setSelectedLocation} />
            </div>
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
          </Group>

          {/* <TaxaSearch onSpeciesSelect={handleSpeciesSelect} /> */}

          <Group grow>
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
          </Group>

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

          <Grid>
            {[
              { label: "Reviewed", key: "reviewed" },
              { label: "Reviewed by me", key: "reviewedByUser" },
              { label: "Needs ID", key: "needsReview" },
              { label: "Accepted", key: "accepted" },
              { label: "All favorites", key: "favorites" },
              { label: "My favorites", key: "userFavorite" },
            ].map(({ label, key }) => (
              <Grid.Col span={6} key={key}>
                <Group className={styles.filterRow}>
                  <Text className={styles.label}>{label}</Text>
                  <Button.Group>
                    <Button
                      className={styles.button}
                      variant={filters[key] === true ? "filled" : "outline"}
                      onClick={() =>
                        handleFilterChange(
                          key,
                          filters[key] === true ? null : true
                        )
                      }
                    >
                      ✓
                    </Button>
                    <Button
                      className={styles.button}
                      variant={filters[key] === false ? "filled" : "outline"}
                      onClick={() =>
                        handleFilterChange(
                          key,
                          filters[key] === false ? null : false
                        )
                      }
                    >
                      ✕
                    </Button>
                  </Button.Group>
                </Group>
              </Grid.Col>
            ))}
          </Grid>
        </Collapse>
      </Stack>
    </>
  );
}
