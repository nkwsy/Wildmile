"use client";

import { useState, useEffect } from "react";
import {
  Group,
  MultiSelect,
  Button,
  Paper,
  Select,
  ActionIcon,
  Tooltip,
  Collapse,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useDisclosure } from "@mantine/hooks";
import {
  IconFilter,
  IconFilterOff,
  IconChevronDown,
  IconChevronUp,
} from "@tabler/icons-react";

export default function WildlifeAnalyticsFilters({ filters, onChange }) {
  const [locations, setLocations] = useState([]);
  const [speciesOptions, setSpeciesOptions] = useState([]);
  const [opened, { toggle }] = useDisclosure(true);

  useEffect(() => {
    async function fetchOptions() {
      try {
        const [locRes, specRes] = await Promise.all([
          fetch("/api/cameratrap/getDeploymentLocations?onlyUsed=true"),
          fetch("/api/cameratrap/analytics/wildlife/species-detail"),
        ]);
        if (locRes.ok) {
          const locData = await locRes.json();
          const opts = (locData || []).map((l) => ({
            value: l._id || l.deploymentId,
            label: l.locationName || l._id,
          }));
          setLocations(opts);
        }
        if (specRes.ok) {
          const specData = await specRes.json();
          if (specData.speciesList) {
            setSpeciesOptions(
              specData.speciesList.map((s) => ({
                value: s.species,
                label: s.commonName
                  ? `${s.commonName} — ${s.species} (${s.count})`
                  : `${s.species} (${s.count})`,
              }))
            );
          }
        }
      } catch (err) {
        console.warn("Failed to fetch filter options:", err);
      }
    }
    fetchOptions();
  }, []);

  const handleClear = () => {
    onChange({
      startDate: null,
      endDate: null,
      species: [],
      deploymentId: null,
    });
  };

  const hasFilters =
    filters.startDate ||
    filters.endDate ||
    filters.species?.length > 0 ||
    filters.deploymentId;

  return (
    <Paper shadow="xs" p="sm" mb="md" withBorder>
      <Group justify="space-between" mb={opened ? "xs" : 0}>
        <Group gap="xs">
          <IconFilter size={18} />
          <Button
            variant="subtle"
            size="compact-sm"
            onClick={toggle}
            rightSection={
              opened ? (
                <IconChevronUp size={14} />
              ) : (
                <IconChevronDown size={14} />
              )
            }
          >
            Filters
          </Button>
        </Group>
        {hasFilters && (
          <Tooltip label="Clear all filters">
            <ActionIcon variant="subtle" color="red" onClick={handleClear}>
              <IconFilterOff size={18} />
            </ActionIcon>
          </Tooltip>
        )}
      </Group>
      <Collapse in={opened}>
        <Group grow align="flex-end" gap="sm">
          <DatePickerInput
            label="Start Date"
            placeholder="From"
            value={filters.startDate}
            onChange={(val) => onChange({ ...filters, startDate: val })}
            clearable
          />
          <DatePickerInput
            label="End Date"
            placeholder="To"
            value={filters.endDate}
            onChange={(val) => onChange({ ...filters, endDate: val })}
            clearable
          />
          <Select
            label="Location"
            placeholder="All locations"
            data={locations}
            value={filters.deploymentId}
            onChange={(val) => onChange({ ...filters, deploymentId: val })}
            clearable
            searchable
          />
          <MultiSelect
            label="Species"
            placeholder="All species"
            data={speciesOptions}
            value={filters.species || []}
            onChange={(val) => onChange({ ...filters, species: val })}
            clearable
            searchable
            maxDropdownHeight={300}
          />
        </Group>
      </Collapse>
    </Paper>
  );
}
