"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Loader,
  Button,
  Tooltip,
  Grid,
  Card,
  Divider,
} from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";

export function InfoComponent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch("/api/cameratrap/getStats");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
      setError("Failed to load statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <Paper p="md" shadow="xs">
        <Group position="center">
          <Loader />
          <Text size="sm" color="dimmed">
            Loading statistics...
          </Text>
        </Group>
      </Paper>
    );
  }

  if (error || !stats) {
    return (
      <Paper p="md" shadow="xs">
        <Stack align="center" spacing="md">
          <Text color="red">{error || "Unable to load statistics"}</Text>
          <Button
            variant="light"
            onClick={handleRefresh}
            leftIcon={<IconRefresh size={16} />}
          >
            Retry
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Stack spacing="lg">
        <Group position="apart">
          <Title order={3}>Camera Trap Statistics</Title>
          <Tooltip label="Refresh statistics">
            <Button
              variant="subtle"
              size="sm"
              onClick={handleRefresh}
              loading={loading}
              leftIcon={<IconRefresh size={16} />}
            >
              Refresh
            </Button>
          </Tooltip>
        </Group>

        <Grid>
          <Grid.Col span={4}>
            <Card withBorder p="md">
              <Text size="sm" color="dimmed" weight={500}>
                Total Images
              </Text>
              <Text size="xl" weight={700} mt="sm">
                {stats.totalImages.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card withBorder p="md">
              <Text size="sm" color="dimmed" weight={500}>
                Images with Observations
              </Text>
              <Text size="xl" weight={700} mt="sm">
                {stats.uniqueMediaIds.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
          <Grid.Col span={4}>
            <Card withBorder p="md">
              <Text size="sm" color="dimmed" weight={500}>
                New Images (30 days)
              </Text>
              <Text size="xl" weight={700} mt="sm">
                {stats.newImages30Days.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder>
          <Group position="apart" mb="md">
            <Text size="md" weight={500}>
              Top Observers
            </Text>
          </Group>

          {stats.topCreators.length > 0 ? (
            <Stack spacing="xs">
              {stats.topCreators.map((creator, index) => (
                <Group key={creator.id || index} position="apart">
                  <Text size="sm">{creator.name || "Unknown User"}</Text>
                  <Text size="sm" color="dimmed">
                    {creator.count.toLocaleString()} observation
                    {creator.count !== 1 ? "s" : ""}
                  </Text>
                </Group>
              ))}
            </Stack>
          ) : (
            <Text size="sm" color="dimmed" fs="italic">
              No observations recorded yet
            </Text>
          )}

          <Divider my="md" />

          <Group position="apart" mb="md">
            <Text size="sm" weight={500}>
              Most Active (7 days)
            </Text>
            <Text size="sm" color="dimmed">
              {stats.mostActive7Days?.name || "No activity"}
              {stats.mostActive7Days?.count
                ? ` (${stats.mostActive7Days.count.toLocaleString()} observation${
                    stats.mostActive7Days.count !== 1 ? "s" : ""
                  })`
                : ""}
            </Text>
          </Group>

          <Group position="apart">
            <Text size="sm" weight={500}>
              Most Blanks Logged
            </Text>
            <Text size="sm" color="dimmed">
              {stats.mostBlanks?.name || "No blanks"}
              {stats.mostBlanks?.count
                ? ` (${stats.mostBlanks.count.toLocaleString()})`
                : ""}
            </Text>
          </Group>
        </Card>
      </Stack>
    </Paper>
  );
}

export default InfoComponent;
