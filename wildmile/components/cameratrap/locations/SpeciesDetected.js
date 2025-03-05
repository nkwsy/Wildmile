"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Text,
  Group,
  Box,
  Skeleton,
  Button,
  Stack,
} from "@mantine/core";
import { IconAnalyze } from "@tabler/icons-react";

export default function SpeciesDetected({ locationId }) {
  const [species, setSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchSpeciesData() {
      try {
        setLoading(true);
        // In a real app, fetch from your API
        // const response = await fetch(`/api/cameratrap/locations/${locationId}/species`);

        // if (!response.ok) {
        //   throw new Error('Failed to fetch species data');
        // }

        // const data = await response.json();
        // setSpecies(data);

        // Mock data for demonstration
        setTimeout(() => {
          setSpecies([
            { name: "Raccoon", count: 218, percentage: 42 },
            { name: "Opossum", count: 112, percentage: 22 },
            { name: "Fox", count: 79, percentage: 15 },
            { name: "Other", count: 109, percentage: 21 },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching species data:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchSpeciesData();
  }, [locationId]);

  if (loading) {
    return (
      <Stack>
        <Group position="apart" mb="md">
          <Title order={4}>Species Detected</Title>
          <Button leftIcon={<IconAnalyze size={16} />}>Full Analytics</Button>
        </Group>

        {[1, 2, 3, 4].map((i) => (
          <Group key={i} position="apart" mb="md">
            <Skeleton height={20} width={100} />
            <Box style={{ flex: 1, marginLeft: 20, marginRight: 20 }}>
              <Skeleton height={20} />
            </Box>
            <Skeleton height={20} width={50} />
          </Group>
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (species.length === 0) {
    return (
      <Text color="dimmed">No species data available for this location.</Text>
    );
  }

  return (
    <Stack>
      <Group position="apart" mb="md">
        <Title order={4}>Species Detected</Title>
        <Button variant="outline" leftIcon={<IconAnalyze size={16} />}>
          Full Analytics
        </Button>
      </Group>

      {species.map((item) => (
        <Group key={item.name} position="apart" mb="md">
          <Text weight={500}>{item.name}</Text>
          <Box
            style={{
              flex: 1,
              marginLeft: 20,
              marginRight: 20,
              height: 10,
              backgroundColor: "#f0f0f0",
              borderRadius: 5,
              overflow: "hidden",
            }}
          >
            <Box
              style={{
                width: `${item.percentage}%`,
                height: "100%",
                backgroundColor:
                  item.name === "Raccoon"
                    ? "#2a7fff"
                    : item.name === "Opossum"
                    ? "#55acee"
                    : item.name === "Fox"
                    ? "#ff9f45"
                    : "#adb5bd",
                borderRadius: 5,
              }}
            />
          </Box>
          <Text size="sm">
            {item.count} ({item.percentage}%)
          </Text>
        </Group>
      ))}
    </Stack>
  );
}
