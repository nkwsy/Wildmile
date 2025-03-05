"use client";

import { useEffect, useState } from "react";
import { Card, Group, Text, Image, Stack, Skeleton, Box } from "@mantine/core";

export default function RecentCaptures({ locationId }) {
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchCaptures() {
      try {
        setLoading(true);
        // In a real app, fetch from your API
        // const response = await fetch(`/api/cameratrap/locations/${locationId}/captures`);

        // if (!response.ok) {
        //   throw new Error('Failed to fetch captures');
        // }

        // const data = await response.json();
        // setCaptures(data);

        // Mock data for demonstration
        setTimeout(() => {
          setCaptures([
            {
              id: "1",
              species: "Raccoon",
              timestamp: "2024-10-23T11:21:00Z",
              confidence: 0.92,
              imageUrl:
                "https://placehold.co/300x200/e9e9e9/a6a6a6?text=Raccoon",
            },
            {
              id: "2",
              species: "Raccoon",
              timestamp: "2024-10-23T11:21:00Z",
              confidence: 0.84,
              imageUrl:
                "https://placehold.co/300x200/e9e9e9/a6a6a6?text=Raccoon",
            },
            {
              id: "3",
              species: "Unknown",
              timestamp: "2024-10-24T22:13:00Z",
              confidence: 0.58,
              imageUrl:
                "https://placehold.co/300x200/e9e9e9/a6a6a6?text=Unknown",
            },
          ]);
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching captures:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchCaptures();
  }, [locationId]);

  if (loading) {
    return (
      <Stack>
        {[1, 2, 3].map((i) => (
          <Card key={i} withBorder>
            <Group noWrap align="flex-start">
              <Skeleton height={60} width={80} />
              <Box style={{ flex: 1 }}>
                <Skeleton height={20} width="60%" mb={8} />
                <Skeleton height={15} width="40%" />
              </Box>
            </Group>
          </Card>
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  if (captures.length === 0) {
    return <Text color="dimmed">No recent captures found.</Text>;
  }

  return (
    <Stack>
      {captures.map((capture) => (
        <Card key={capture.id} withBorder>
          <Group noWrap align="flex-start">
            <Image
              src={capture.imageUrl}
              alt={capture.species}
              width={80}
              height={60}
              fit="cover"
              radius="sm"
            />
            <Stack spacing={0}>
              <Text weight={500}>{capture.species}</Text>
              <Text size="xs" color="dimmed">
                {new Date(capture.timestamp).toLocaleString([], {
                  month: "numeric",
                  day: "numeric",
                  year: "2-digit",
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}
              </Text>
              <Text size="xs" color="dimmed">
                Confidence: {(capture.confidence * 100).toFixed(0)}%
              </Text>
            </Stack>
          </Group>
        </Card>
      ))}
    </Stack>
  );
}
