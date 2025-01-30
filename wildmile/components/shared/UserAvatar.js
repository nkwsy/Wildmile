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
  Indicator,
} from "@mantine/core";
import {
  IconPaw,
  IconTrophy,
  IconCamera,
  IconCalendarStats,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
export function UserAvatar({ userId, size = "sm" }) {
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opened, { close, open }] = useDisclosure(false);

  useEffect(() => {
    fetchUserStats();
  }, [userId]);

  const fetchUserStats = async () => {
    if (!userId || loading) return;
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cameratrap/getUserStats?userId=${userId}`
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
      <Avatar
        size={size}
        src={userStats?.user?.avatar}
        radius="xl"
        sx={{ cursor: "pointer" }}
        onMouseEnter={open}
        onMouseLeave={close}
      ></Avatar>

      <Popover.Target>
        <div onMouseEnter={open} onMouseLeave={close}>
          <Text size="sm" weight={500}>
            {userStats?.user?.profile?.name || "Anonymous"}
          </Text>
          <Text size="xs" color="dimmed">
            Level {userStats?.level || 1}
          </Text>
        </div>
      </Popover.Target>
      <Popover.Dropdown onMouseEnter={open} onMouseLeave={close}>
        <Stack spacing="xs">
          {/* User Header */}
          <Group position="apart" align="center">
            <Group>
              <Avatar size="md" src={userStats?.user?.avatar} radius="xl">
                {userStats?.user?.profile?.name?.charAt(0) || "?"}
              </Avatar>
              <div>
                <Text size="sm" weight={500}>
                  {userStats?.user?.profile?.name || "Anonymous"}
                </Text>
                <Text size="xs" color="dimmed">
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
          <Group grow spacing="xs">
            <Paper withBorder p="xs" radius="md">
              <Group spacing={4}>
                <IconPaw size={16} />
                <Text size="xs">
                  {formatNumber(userStats?.stats?.animalsObserved || 0)}
                </Text>
              </Group>
              <Text size="xs" color="dimmed">
                Animals
              </Text>
            </Paper>
            <Paper withBorder p="xs" radius="md">
              <Group spacing={4}>
                <IconCamera size={16} />
                <Text size="xs">
                  {formatNumber(userStats?.stats?.imagesReviewed || 0)}
                </Text>
              </Group>
              <Text size="xs" color="dimmed">
                Reviewed
              </Text>
            </Paper>
            <Paper withBorder p="xs" radius="md">
              <Group spacing={4}>
                <IconCalendarStats size={16} />
                <Text size="xs">{userStats?.streaks?.current || 0}</Text>
              </Group>
              <Text size="xs" color="dimmed">
                Streak
              </Text>
            </Paper>
          </Group>

          {/* Recent Achievements */}
          {userStats?.achievements?.length > 0 && (
            <Stack spacing={4}>
              <Text size="xs" weight={500}>
                Recent Achievements
              </Text>
              <Group spacing={4}>
                {userStats.achievements
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
          {userStats?.domainRanks &&
            Object.entries(userStats.domainRanks).length > 0 && (
              <Stack spacing={4}>
                <Text size="xs" weight={500}>
                  Domain Ranks
                </Text>
                <Group spacing={4}>
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
          <Text size="xs" color="dimmed" align="center">
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
