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
  IconCalendarStats,
} from "@tabler/icons-react";
import { useUser } from "lib/hooks";

export function UserInfoComponent() {
  const { user, loading } = useUser();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading) {
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const updatedUserStats = await fetch(`/api/user/progress/update`, {
        method: "POST",
        body: JSON.stringify({ userId: user._id }),
        next: { revalidate: 3600 }, // revalidate every hour
      });
      const response = await fetch(
        `/api/cameratrap/getUserStats?userId=${user._id}`,
        { next: { revalidate: 3600 } }
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
        {/* Recent Achievements */}
        {stats?.achievements?.length > 0 && (
          <Stack spacing={4}>
            <Text size="xs" weight={500}>
              Recent Achievements
            </Text>
            <Group spacing={4}>
              {stats.achievements
                .filter((a) => a.progress === 100)
                .slice(0, 5)
                .map((achievement) => (
                  <Tooltip
                    key={achievement.id}
                    label={`${achievement.name}: ${achievement.description}`}
                  >
                    <Avatar
                      size="sm"
                      src={achievement.icon || achievement.badge || "💩"}
                    >
                      {achievement.points}
                    </Avatar>
                  </Tooltip>
                ))}
            </Group>
          </Stack>
        )}

        {/* Domain Ranks */}
        {stats?.domainRanks && Object.entries(stats.domainRanks).length > 0 && (
          <Stack spacing={4}>
            <Text size="xs" weight={500}>
              Domain Ranks
            </Text>
            <Group spacing={4}>
              {Object.entries(stats.domainRanks).map(([domain, rank]) => (
                <Tooltip
                  key={domain}
                  label={`${domain}: ${rank.points} points`}
                >
                  <Badge size="sm" variant="light">
                    {domain}: {rank.points}
                  </Badge>
                </Tooltip>
              ))}
            </Group>
          </Stack>
        )}

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
            {/* Quick Stats */}
            <SimpleGrid cols={3} spacing="xs">
              <Paper withBorder p="xs" radius="md">
                <Group spacing={4}>
                  <IconPaw size={16} />
                  <Text size="xs">{stats?.stats?.animalsObserved || 0}</Text>
                </Group>
                <Text size="xs" color="dimmed">
                  Animals Observed
                </Text>
              </Paper>
              <Paper withBorder p="xs" radius="md">
                <Group spacing={4}>
                  <IconCamera size={16} />
                  <Text size="xs">{stats?.stats?.imagesReviewed || 0}</Text>
                </Group>
                <Text size="xs" color="dimmed">
                  Images Reviewed
                </Text>
              </Paper>
              <Paper withBorder p="xs" radius="md">
                <Group spacing={4}>
                  <IconCalendarStats size={16} />
                  <Text size="xs">{stats?.streaks?.current || 0}</Text>
                </Group>
                <Text size="xs" color="dimmed">
                  Consecutive Days
                </Text>
              </Paper>
              <Paper withBorder p="xs" radius="md">
                <Group spacing={4}>
                  <IconEye size={16} />
                  <Text size="xs">{stats?.stats?.totalBlanksLogged || 0}</Text>
                </Group>
                <Text size="xs" color="dimmed">
                  Blank Images
                </Text>
              </Paper>
              <Paper withBorder p="xs" radius="md">
                <Group spacing={4}>
                  <IconMedal size={16} />
                  <Text size="xs">
                    {stats.uniqueSpeciesCount.toLocaleString()}
                  </Text>
                </Group>
                <Text size="xs" color="dimmed" weight={500}>
                  Species Found
                </Text>
              </Paper>
            </SimpleGrid>

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
