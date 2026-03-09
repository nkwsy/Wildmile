"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useDisclosure } from "@mantine/hooks";
import { SimpleGrid, Skeleton, Button, Collapse, Group } from "@mantine/core";
import {
  IconChevronDown,
  IconChevronUp,
  IconRefresh,
} from "@tabler/icons-react";
import Species from "./SpeciesCard";
import { useRecentSpecies } from "./ContextCamera";

const RecentSpecies = () => {
  const [speciesData, setSpeciesData] = useRecentSpecies();
  const [loading, setLoading] = useState(true);
  const [opened, { toggle }] = useDisclosure(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSpecies = useCallback(async () => {
    try {
      const response = await fetch("/api/cameratrap/recent-species");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setSpeciesData(data);
    } catch (error) {
      console.error("Error fetching recent species:", error);
    }
  }, [setSpeciesData]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadSpecies();
      if (mounted) setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, [loadSpecies]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSpecies();
    setRefreshing(false);
  };

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
            opened ? (
              <IconChevronUp size={16} />
            ) : (
              <IconChevronDown size={16} />
            )
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
          <Species results={speciesData} />
        </SimpleGrid>
      </Collapse>
    </div>
  );
};

export default RecentSpecies;
