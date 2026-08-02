"use client";

import React, { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Avatar,
  Badge,
  Popover,
  Paper,
  Progress,
  Tooltip,
} from "@mantine/core";
import {
  IconPaw,
  IconCamera,
  IconCalendarStats,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";

export function UserAvatar({ userId, size = "sm" }) {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);

  useEffect(() => {
    if (userId) {
      fetchUserStats();
    }
  }, [userId]);

  const fetchUserStats = async () => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cameratrap/getUserStats?userId=${userId}`,
        { next: { revalidate: 3600 } }
      );
      const data = await response.json();
      setUserStats(data);
    } catch (error) {
      console.error("Error fetching user stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`;
    }
    return num;
  };

  if (loading) return null;

  return (
    <Popover
      width={300}
      position="bottom"
      withArrow
      shadow="md"
      opened={opened}
    >
      <Popover.Target>
        <Group
          gap="xs"
          wrap="nowrap"
          style={{ cursor: "pointer", minWidth: 0, flex: 1 }}
          onMouseEnter={open}
          onMouseLeave={close}
        >
          <Avatar
            size={size}
            src={
              userStats?.domainRanks?.CAMERATRAP?.currentRank?.badge ||
              userStats?.user?.avatar ||
              "💩"
            }
            radius="xl"
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <Text size="sm" fw={500} truncate="end" maw={150}>
              {userStats?.user?.profile?.name || "Anonymous"}
            </Text>
            <Text size="xs" c="dimmed">
              Level {userStats?.level || 1}
            </Text>
          </div>
        </Group>
      </Popover.Target>
      <Popover.Dropdown onMouseEnter={open} onMouseLeave={close}>
        <Stack gap="xs">
          {/* User Header */}
          <Group justify="space-between" align="center">
            <Group>
              <Avatar size="md" src={userStats?.user?.avatar} radius="xl">
                {userStats?.user?.profile?.name?.charAt(0) || "?"}
              </Avatar>
              <div>
                <Text size="sm" fw={500}>
                  {userStats?.user?.profile?.name || "Anonymous"}
                </Text>
                <Text size="xs" c="dimmed">
                  Level {userStats?.level || 1}
                </Text>
              </div>
            </Group>
          </Group>

          {/* Progress to Next Level */}
          <Tooltip label={`${userStats?.totalPoints || 0} points`}>
            <Progress
              value={userStats?.totalPoints % 100}
              size="sm"
              radius="xl"
            />
          </Tooltip>

          {/* Quick Stats */}
          <Group grow gap="xs">
            <Paper withBorder p="xs" radius="md">
              <Group gap={4}>
                <IconPaw size={16} />
                <Text size="xs">
                  {formatNumber(userStats?.totalAnimalsObserved || userStats?.stats?.animalsObserved || 0)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                Animals
              </Text>
            </Paper>
            <Paper withBorder p="xs" radius="md">
              <Group gap={4}>
                <IconCamera size={16} />
                <Text size="xs">
                  {formatNumber(userStats?.totalImagesReviewed || userStats?.stats?.imagesReviewed || 0)}
                </Text>
              </Group>
              <Text size="xs" c="dimmed">
                Reviewed
              </Text>
            </Paper>
            <Paper withBorder p="xs" radius="md">
              <Group gap={4}>
                <IconCalendarStats size={16} />
                <Text size="xs">{userStats?.streaks?.current || 0}</Text>
              </Group>
              <Text size="xs" c="dimmed">
                Streak
              </Text>
            </Paper>
          </Group>

          {/* Recent Achievements */}
          {userStats?.achievements?.length > 0 && (
            <Stack gap={4}>
              <Text size="xs" fw={500}>
                Recent Achievements
              </Text>
              <Group gap={4}>
                {userStats.achievements
                  .filter((a) => a.progress === 100)
                  .slice(0, 5)
                  .map((achievement) => {
                    return (
                      <Tooltip
                        key={achievement.id}
                        label={`${achievement.name}: ${achievement.description}`}
                      >
                        <Avatar
                          size="sm"
                          src={
                            achievement.badge ||
                            achievement.icon ||
                            "💩"
                          }
                        >
                          {achievement.points}
                        </Avatar>
                      </Tooltip>
                    );
                  })}
              </Group>
            </Stack>
          )}

          {/* Domain Ranks */}
          {userStats?.domainRanks &&
            Object.entries(userStats.domainRanks).length > 0 && (
              <Stack gap={4}>
                <Text size="xs" fw={500}>
                  Domain Ranks
                </Text>
                <Group gap={4}>
                  {Object.entries(userStats.domainRanks).map(
                    ([domain, rank]) => (
                      <Tooltip
                        key={domain}
                        label={`${domain}: ${rank.points} points`}
                      >
                        <Badge size="sm" variant="light">
                          {domain}: {rank.points}
                        </Badge>
                      </Tooltip>
                    )
                  )}
                </Group>
              </Stack>
            )}

          {/* Last Active */}
          <Text size="xs" c="dimmed" ta="center">
            Last active:{" "}
            {userStats?.lastActive
              ? new Date(userStats.lastActive).toLocaleDateString()
              : "Never"}
          </Text>
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
