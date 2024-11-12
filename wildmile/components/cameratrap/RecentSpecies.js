"use client";
import React, { useState, useEffect } from "react";
import { useDisclosure } from "@mantine/hooks";
import { SimpleGrid, Skeleton, Button, Collapse, Group } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
} from "@tabler/icons-react";
import Species from "./SpeciesCard";

const RecentSpecies = ({ onSpeciesSelect }) => {
  const [recentSpecies, setRecentSpecies] = useState([]);
  const [speciesData, setSpeciesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [opened, { toggle }] = useDisclosure(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch recent species from our database
  const fetchRecentSpecies = async () => {
    try {
      const response = await fetch(`/api/cameratrap/recent-species`, {
        cache: "no-store",
      });
      const data = await response.json();
      return data.map((item) => item.species);
    } catch (error) {
      console.error("Error fetching recent species:", error);
      return [];
    }
  };

  // Fetch species details from iNaturalist
  const fetchSpeciesDetails = async (species) => {
    try {
      const response = await fetch(
        `/api/species?species=${encodeURIComponent(species)}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching species details:", error);
      return null;
    }
  };

  const loadSpecies = async () => {
    setLoading(true);
    const species = await fetchRecentSpecies();
    setRecentSpecies(species);

    const detailsPromises = species.map(fetchSpeciesDetails);
    const details = await Promise.all(detailsPromises);
    setSpeciesData(details.filter((detail) => detail !== null));
    setLoading(false);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSpecies();
    setRefreshing(false);
  };

  useEffect(() => {
    loadSpecies();
  }, []);

  if (loading) {
    return (
      <div>
        <Group justify="space-between" mb="sm">
          <Button
            onClick={toggle}
            variant="default"
            rightSection={
              opened ? (
                <IconChevronUp size={16} />
              ) : (
                <IconChevronDown size={16} />
              )
            }
          >
            Recently Tagged Species
          </Button>
          <Button
            variant="default"
            onClick={handleRefresh}
            disabled={true}
            leftSection={<IconRefresh size={16} />}
          >
            Refresh
          </Button>
        </Group>
        <Collapse in={opened}>
          <SimpleGrid
            cols={3}
            spacing="md"
            breakpoints={[
              { maxWidth: "62rem", cols: 2, spacing: "md" },
              { maxWidth: "48rem", cols: 1, spacing: "sm" },
            ]}
          >
            {[...Array(6)].map((_, index) => (
              <Skeleton key={index} height={200} radius="md" />
            ))}
          </SimpleGrid>
        </Collapse>
      </div>
    );
  }

  return (
    <div>
      <Group justify="space-between" mb="sm">
        <Button
          onClick={toggle}
          variant="default"
          rightSection={
            opened ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />
          }
        >
          Recently Tagged Species
        </Button>
        <Collapse in={opened}>
          <Button
            variant="default"
            onClick={handleRefresh}
            loading={refreshing}
            leftSection={<IconRefresh size={16} />}
          >
            Refresh
          </Button>
        </Collapse>
      </Group>
      <Collapse in={opened}>
        <SimpleGrid
          cols={3}
          spacing="md"
          breakpoints={[
            { maxWidth: "62rem", cols: 2, spacing: "md" },
            { maxWidth: "48rem", cols: 1, spacing: "sm" },
          ]}
        >
          <Species results={speciesData} onSpeciesSelect={onSpeciesSelect} />
        </SimpleGrid>
      </Collapse>
    </div>
  );
};

export default RecentSpecies;
