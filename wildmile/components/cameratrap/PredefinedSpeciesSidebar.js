"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Loader,
  SimpleGrid,
  SegmentedControl,
  Stack,
  Text,
  Center,
  Tooltip,
  Group,
  ActionIcon,
  ScrollArea,
  Divider,
  TextInput,
  Button,
} from "@mantine/core";
import { IconClock, IconRefresh, IconSearch, IconHelp, IconListCheck, IconX } from "@tabler/icons-react";
import { Fish, Turtle, Bird, Rabbit, Search } from "lucide-react";
import { FrogIcon } from "/styles/icons/Frog";
import useSWR from "swr";
import { useRecentSpecies, useUserLabeledSpecies, useTutorial, useSelection } from "./ContextCamera";
import { useUser } from "lib/hooks";

const fetcher = (url) => fetch(url).then((res) => res.json());

import Species, { SpeciesList } from "./SpeciesCard";

function iconicTaxonNameToCategory(iconic_taxon_name) {
  switch (iconic_taxon_name) {
    case "Mammalia":
      return "Mammals";
    case "Aves":
      return "Birds";
    case "Reptilia":
      return "Reptiles";
    case "Amphibia":
      return "Amphibians";
    case "Actinopterygii":
      return "Fish";
    default:
      return "Other";
  }
}

export default function PredefinedSpeciesSidebar({
  onSpeciesSelect,
  searchControl,
}) {
  const { user } = useUser();
  const [runTutorial, setRunTutorial] = useTutorial();
  const [lastSelected, setLastSelected] = useState([]);
  const {
    data: predefinedData,
    error: predefinedError,
    isLoading: predefinedLoading,
  } = useSWR("/api/species/predefined-species", fetcher, {
    revalidateOnFocus: false,
  });

  const [recentSpecies, setRecentSpecies] = useRecentSpecies();
  const [userLabeledSpecies, setUserLabeledSpecies] = useUserLabeledSpecies();
  const [selection] = useSelection();
  const [recentLoading, setRecentLoading] = useState(true);
  const [userLabeledLoading, setUserLabeledLoading] = useState(true);

  const loadRecent = useCallback(async () => {
    try {
      const res = await fetch("/api/cameratrap/recent-species");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setRecentSpecies(data);
    } catch (error) {
      console.error("Error fetching recent species:", error);
    }
  }, [setRecentSpecies]);

  const loadUserLabeled = useCallback(async () => {
    try {
      const res = await fetch("/api/cameratrap/user-labeled-species");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUserLabeledSpecies(data);
    } catch (error) {
      console.error("Error fetching user labeled species:", error);
    }
  }, [setUserLabeledSpecies]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setRecentLoading(true);
      setUserLabeledLoading(true);
      await Promise.all([loadRecent(), loadUserLabeled()]);
      if (mounted) {
        setRecentLoading(false);
        setUserLabeledLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [loadRecent, loadUserLabeled, user]);

  const [selectedCategory, setSelectedCategory] = useState("selected");
  const [searchQuery, setSearchQuery] = useState("");
  const [isFilterActive, setIsFilterActive] = useState(false);

  const updateLastSelected = useCallback((species) => {
    setLastSelected((prev) => {
      const speciesId = species.taxonId || species.id;
      const filtered = prev.filter((s) => (s.taxonId || s.id) !== speciesId);
      return [species, ...filtered].slice(0, 4);
    });
  }, []);

  const handleSpeciesSelectWithTracking = (species) => {
    if (onSpeciesSelect) {
      onSpeciesSelect(species);
    }
    updateLastSelected(species);
  };

  const handleRefresh = async () => {
    if (selectedCategory === "recent") {
      setRecentLoading(true);
      await loadRecent();
      setRecentLoading(false);
    } else if (selectedCategory === "all") {
      setUserLabeledLoading(true);
      await loadUserLabeled();
      setUserLabeledLoading(false);
    }
  };

  const categoryData = [
    {
      value: "selected",
      label: (
        <Tooltip label="Selected Animals" withinPortal portalProps={{ zIndex: 1000000 }}>
          <Center>
            <IconListCheck size={20} stroke={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "all",
      label: (
        <Tooltip label="All Species" withinPortal portalProps={{ zIndex: 1000000 }}>
          <Center>
            <IconSearch size={20} stroke={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Mammals",
      label: (
        <Tooltip label="Mammals" withinPortal portalProps={{ zIndex: 1000000 }}>
          <Center>
            <Rabbit strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Reptiles",
      label: (
        <Tooltip label="Reptiles" withinPortal portalProps={{ zIndex: 1000000 }}>
          <Center>
            <Turtle strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Amphibians",
      label: (
        <Tooltip label="Amphibians" withinPortal portalProps={{ zIndex: 1000000 }}>
          <Center>
            <FrogIcon strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Birds",
      label: (
        <Tooltip label="Birds" withinPortal portalProps={{ zIndex: 1000000 }}>
          <Center>
            <Bird />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Fish",
      label: (
        <Tooltip label="Fish" withinPortal portalProps={{ zIndex: 1000000 }}>
          <Center>
            <Fish />
          </Center>
        </Tooltip>
      ),
    },
  ];

  const handleCategoryChange = (newValue) => {
    setSelectedCategory((prev) => (prev === newValue ? null : newValue));
    setIsFilterActive(false);
  };

  if (predefinedError) {
    return <div>Error loading predefined species data.</div>;
  }

  const isLoading =
    predefinedLoading ||
    (selectedCategory === "recent" && recentLoading) ||
    (selectedCategory === "user" && userLabeledLoading);

  if (isLoading) {
    return <Loader />;
  }

  let filteredResults = [];
  if (
    selectedCategory &&
    selectedCategory !== "selected" &&
    selectedCategory !== "all"
  ) {
    filteredResults = predefinedData
      ?.filter((spec) => spec)
      .filter(
        (spec) =>
          iconicTaxonNameToCategory(spec.iconic_taxon_name) === selectedCategory
      );
  } else if (selectedCategory === "selected") {
    filteredResults = selection || [];
  } else if (selectedCategory === "all") {
    filteredResults = predefinedData || [];
  }

  // Apply search filter if active
  if (isFilterActive && searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filteredResults = filteredResults.filter((spec) => {
      const commonName = (spec.preferred_common_name || "").toLowerCase();
      const scientificName = (spec.name || "").toLowerCase();
      return commonName.includes(query) || scientificName.includes(query);
    });
  }

  // Sort alphabetically unless it's the "selected" category (and not searching)
  if (selectedCategory !== "selected" || (isFilterActive && searchQuery.trim())) {
    filteredResults = [...filteredResults].sort((a, b) => {
      const nameA = (a.preferred_common_name || a.name || "").toLowerCase();
      const nameB = (b.preferred_common_name || b.name || "").toLowerCase();
      return nameA.localeCompare(nameB);
    });
  }

  return (
    <Stack gap={2} h="100%">
      <Group justify="space-between" align="center">
        <Group gap="xs">
          <Text size="md" fw={700} id="species-title">
            Species
          </Text>
          {selectedCategory === "all" && (
            <ActionIcon variant="subtle" onClick={handleRefresh} size="sm">
              <IconRefresh size={16} />
            </ActionIcon>
          )}
        </Group>
      </Group>

      <Group gap={4} wrap="nowrap">
        <TextInput
          placeholder="Filter species..."
          size="xs"
          leftSection={<Search size={14} />}
          value={searchQuery}
          onChange={(event) => {
            const val = event.currentTarget.value;
            setSearchQuery(val);
            setIsFilterActive(true);
            if (val.trim() && selectedCategory !== "all") {
              setSelectedCategory("all");
            }
          }}
          rightSection={
            searchQuery && (
              <ActionIcon
                size="sm"
                variant="subtle"
                color="gray"
                onClick={() => {
                  setSearchQuery("");
                  setIsFilterActive(false);
                }}
              >
                <IconX size={14} />
              </ActionIcon>
            )
          }
          style={{ flex: 1 }}
        />
        {searchControl}
      </Group>

      <SegmentedControl
        id="species-tabs"
        value={selectedCategory}
        onChange={handleCategoryChange}
        data={categoryData}
        size="xs"
        fullWidth
        styles={(theme) => ({
          root: {
            backgroundColor: 'var(--mantine-color-gray-0)',
          },
          label: {
            '&[dataActive]': {
              color: 'var(--mantine-color-blue-7)',
            },
          },
          indicator: {
            backgroundColor: 'var(--mantine-color-white)',
          },
        })}
      />

      {selectedCategory && (
        <ScrollArea
          style={{ flex: selectedCategory === 'selected' ? 'none' : 1 }}
          mah={{ base: 210, sm: "none" }}
          offsetScrollbars
        >
          {selectedCategory === "all" ? (
            <Stack gap="md">
              {!isFilterActive && recentSpecies.length > 0 && (
                <Stack gap={4}>
                  <Divider
                    label={user ? "Recently Saved" : "Commonly Observed"}
                    labelPosition="left"
                    styles={{ label: { fontWeight: 700, fontSize: 'var(--mantine-font-size-sm)' } }}
                  />
                  <SpeciesList
                    results={recentSpecies.slice(0, 10)}
                    onSpeciesSelect={handleSpeciesSelectWithTracking}
                  />
                </Stack>
              )}
              {["Mammals", "Birds", "Reptiles", "Amphibians", "Fish", "Other"].map(
                (category) => {
                  const speciesInCategory = (filteredResults || [])
                    .filter(
                      (s) =>
                        iconicTaxonNameToCategory(s.iconic_taxon_name) ===
                        category
                    )
                    .sort((a, b) => {
                      const nameA = (
                        a.preferred_common_name ||
                        a.name ||
                        ""
                      ).toLowerCase();
                      const nameB = (
                        b.preferred_common_name ||
                        b.name ||
                        ""
                      ).toLowerCase();
                      return nameA.localeCompare(nameB);
                    });

                  if (speciesInCategory.length === 0) return null;

                  return (
                    <Stack key={category} gap="xs">
                      <Divider
                        label={category}
                        labelPosition="left"
                        styles={{ label: { fontWeight: 700, fontSize: 'var(--mantine-font-size-sm)' } }}
                      />
                      <SpeciesList
                        results={speciesInCategory}
                        onSpeciesSelect={handleSpeciesSelectWithTracking}
                      />
                    </Stack>
                  );
                }
              )}
            </Stack>
          ) : (
            filteredResults?.length > 0 && (
              <SpeciesList
                results={filteredResults}
                onSpeciesSelect={handleSpeciesSelectWithTracking}
              />
            )
          )}
        </ScrollArea>
      )}
    </Stack>
  );
}
