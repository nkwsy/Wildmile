"use client";
import React, { useState } from "react";
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
} from "@mantine/core";
import { IconClock, IconRefresh } from "@tabler/icons-react";
import { Fish, Turtle, Bird, Rabbit } from "lucide-react";
import { FrogIcon } from "/styles/icons/Frog";
import useSWR from "swr";

const fetcher = (url) => fetch(url).then((res) => res.json());

import Species from "./SpeciesCard";

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

export default function PredefinedSpeciesSidebar({ onSpeciesSelect }) {
  const {
    data: predefinedData,
    error: predefinedError,
    isLoading: predefinedLoading,
  } = useSWR("/api/species/predefined-species", fetcher, {
    revalidateOnFocus: false,
  });

  const {
    data: recentData,
    error: recentError,
    isLoading: recentLoading,
    mutate: mutateRecent,
  } = useSWR("/api/cameratrap/recent-species", fetcher, {
    revalidateOnFocus: false,
  });

  const [selectedCategory, setSelectedCategory] = useState("Mammals");

  const handleRefresh = () => {
    if (selectedCategory === "recent") {
      mutateRecent();
    }
  };

  const categoryData = [
    {
      value: "recent",
      label: (
        <Tooltip label="Recently Used">
          <Center>
            <IconClock size={20} stroke={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Mammals",
      label: (
        <Tooltip label="Mammals">
          <Center>
            <Rabbit strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Reptiles",
      label: (
        <Tooltip label="Reptiles">
          <Center>
            <Turtle strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Amphibians",
      label: (
        <Tooltip label="Amphibians">
          <Center>
            <FrogIcon strokeWidth={1.5} />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Birds",
      label: (
        <Tooltip label="Birds">
          <Center>
            <Bird />
          </Center>
        </Tooltip>
      ),
    },
    {
      value: "Fish",
      label: (
        <Tooltip label="Fish">
          <Center>
            <Fish />
          </Center>
        </Tooltip>
      ),
    },
  ];

  const handleCategoryChange = (newValue) => {
    setSelectedCategory((prev) => (prev === newValue ? null : newValue));
  };

  if (predefinedError) {
    return <div>Error loading predefined species data.</div>;
  }
  if (recentError) {
    return <div>Error loading recent species data.</div>;
  }

  const isLoading = predefinedLoading || recentLoading;

  if (isLoading) {
    return <Loader />;
  }

  let filteredResults = [];
  if (selectedCategory && selectedCategory !== "recent") {
    filteredResults = predefinedData
      ?.filter((spec) => spec)
      .filter(
        (spec) =>
          iconicTaxonNameToCategory(spec.iconic_taxon_name) === selectedCategory
      );
  } else if (selectedCategory === "recent") {
    filteredResults = recentData?.filter((r) => r);
  }

  return (
    <Stack spacing="md">
      <Group position="apart">
        <Text size="lg" fw={500}>
          Common Species
        </Text>
        {selectedCategory === "recent" && (
          <ActionIcon variant="subtle" onClick={handleRefresh}>
            <IconRefresh size={20} />
          </ActionIcon>
        )}
      </Group>

      <SegmentedControl
        value={selectedCategory}
        onChange={handleCategoryChange}
        data={categoryData}
        size="md"
      />

      {selectedCategory && filteredResults?.length > 0 && (
        <SimpleGrid cols={3} spacing="md">
          <Species
            results={filteredResults}
            onSpeciesSelect={onSpeciesSelect}
          />
        </SimpleGrid>
      )}
    </Stack>
  );
}
