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
  SimpleGrid,
  Progress,
  Tooltip,
  Tabs,
} from "@mantine/core";
import {
  IconPaw,
  IconCamera,
  IconEye,
  IconMedal,
  IconTrophy,
  IconStars,
} from "@tabler/icons-react";
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
        <Group position="apart" align="flex-start">
          <Group>
            <Stack spacing={0}>
              <Avatar size={80} src={stats.user.avatar} radius="xl">
                {stats.user.profile?.name?.charAt(0) || "?"}
              </Avatar>
              {stats.currentRank && (
                <Badge
                  variant="gradient"
                  gradient={{ from: "gold", to: "orange" }}
                  style={{ width: "fit-content", margin: "0 auto" }}
                >
                  {stats.currentRank}
                </Badge>
              )}
            </Stack>
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
              {stats.totalPoints && (
                <Text size="sm" color="dimmed" mt="xs">
                  <Group spacing="xs">
                    <IconTrophy size={16} />
                    {stats.totalPoints.toLocaleString()} points
                  </Group>
                </Text>
              )}
            </div>
          </Group>
        </Group>

        <Tabs defaultValue="stats">
          <Tabs.List>
            <Tabs.Tab value="stats" icon={<IconStars size={14} />}>
              Statistics
            </Tabs.Tab>
            <Tabs.Tab value="achievements" icon={<IconTrophy size={14} />}>
              Achievements
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="stats" pt="xs">
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

            <Card withBorder mt="md">
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
          </Tabs.Panel>

          <Tabs.Panel value="achievements" pt="xs">
            <SimpleGrid
              cols={3}
              spacing="lg"
              breakpoints={[
                { maxWidth: "md", cols: 2 },
                { maxWidth: "sm", cols: 1 },
              ]}
            >
              {stats.achievements?.map((achievement) => (
                <Card key={achievement._id} withBorder padding="lg" radius="md">
                  <Card.Section p="md">
                    <Group position="center">
                      {achievement.badge ? (
                        <img
                          src={achievement.badge}
                          alt={achievement.name}
                          style={{
                            width: "64px",
                            height: "64px",
                            objectFit: "contain",
                          }}
                        />
                      ) : (
                        <Text size="xl">{achievement.icon || "🏆"}</Text>
                      )}
                    </Group>
                  </Card.Section>

                  <Stack spacing="xs" mt="md">
                    <Text weight={500} align="center">
                      {achievement.name}
                    </Text>
                    <Text size="sm" color="dimmed" align="center">
                      {achievement.description}
                    </Text>
                    <Badge
                      variant="light"
                      color="blue"
                      style={{ width: "fit-content", margin: "0 auto" }}
                    >
                      {achievement.type}
                    </Badge>
                    {achievement.progress < 100 && (
                      <Tooltip label={`${achievement.progress}% Complete`}>
                        <Progress
                          value={achievement.progress}
                          size="sm"
                          mt="sm"
                          color={achievement.progress >= 100 ? "green" : "blue"}
                        />
                      </Tooltip>
                    )}
                  </Stack>
                </Card>
              ))}
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Paper>
  );
}
