"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Loader,
  Grid,
  Card,
  Badge,
  Avatar,
} from "@mantine/core";
import { IconPaw, IconCamera, IconEye, IconMedal } from "@tabler/icons-react";
import { useUser } from "lib/hooks";

export function UserInfoComponent() {
  const { user, loading } = useUser();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchUserStats();
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const response = await fetch(
        `/api/cameratrap/getUserStats?userId=${user._id}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      //   setError("Failed to load user statistics");
    }
  };

  if (loading) {
    return (
      <Paper p="md" shadow="xs">
        <Group position="center">
          <Loader />
          <Text size="sm" color="dimmed">
            Loading user statistics...
          </Text>
        </Group>
      </Paper>
    );
  }

  if (error || !stats) {
    return (
      <Paper p="md" shadow="xs">
        <Text color="red" align="center">
          {error || "Unable to load user statistics"}
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Stack spacing="lg">
        <Group position="apart" align="center">
          <Group>
            <Avatar size="lg" src={stats.user.profile?.picture} radius="xl">
              {stats.user.profile?.name?.charAt(0) || "?"}
            </Avatar>
            <div>
              <Title order={3}>
                {stats.user.profile?.name || "Anonymous User"}
              </Title>
              <Group spacing="xs">
                {stats.user.roles.map((role, index) => (
                  <Badge key={index} size="sm" variant="light">
                    {role}
                  </Badge>
                ))}
              </Group>
            </div>
          </Group>
        </Group>

        <Grid>
          <Grid.Col span={6} sm={3}>
            <Card withBorder p="md">
              <Group position="apart">
                <IconCamera size={24} />
                <Text size="sm" color="dimmed" weight={500}>
                  Images Reviewed
                </Text>
              </Group>
              <Text size="xl" weight={700} mt="sm">
                {stats.totalImagesReviewed.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6} sm={3}>
            <Card withBorder p="md">
              <Group position="apart">
                <IconPaw size={24} />
                <Text size="sm" color="dimmed" weight={500}>
                  Animals Observed
                </Text>
              </Group>
              <Text size="xl" weight={700} mt="sm">
                {stats.totalAnimalsObserved.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6} sm={3}>
            <Card withBorder p="md">
              <Group position="apart">
                <IconEye size={24} />
                <Text size="sm" color="dimmed" weight={500}>
                  Blank Images
                </Text>
              </Group>
              <Text size="xl" weight={700} mt="sm">
                {stats.totalBlanksLogged.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>

          <Grid.Col span={6} sm={3}>
            <Card withBorder p="md">
              <Group position="apart">
                <IconMedal size={24} />
                <Text size="sm" color="dimmed" weight={500}>
                  Species Found
                </Text>
              </Group>
              <Text size="xl" weight={700} mt="sm">
                {stats.uniqueSpeciesCount.toLocaleString()}
              </Text>
            </Card>
          </Grid.Col>
        </Grid>

        <Card withBorder>
          <Title order={4} mb="md">
            Top Species Observed
          </Title>
          <Stack spacing="xs">
            {stats.topSpecies.map((species, index) => (
              <Group key={index} position="apart">
                <Text size="sm">
                  {species.commonName || species.scientificName}
                </Text>
                <Text size="sm" color="dimmed">
                  {species.count.toLocaleString()} observation
                  {species.count !== 1 ? "s" : ""}
                </Text>
              </Group>
            ))}
          </Stack>
        </Card>
      </Stack>
    </Paper>
  );
}
