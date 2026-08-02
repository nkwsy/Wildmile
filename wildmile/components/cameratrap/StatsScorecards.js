"use client";
import React from "react";
import { Card, Text, SimpleGrid, Group } from "@mantine/core";
import {
  IconPhoto,
  IconEye,
  IconClock,
  IconUsers,
  IconCalendarStats,
} from "@tabler/icons-react";

export function StatsScorecards({ stats }) {
  const scorecardData = [
    {
      title: "Total Images",
      value: stats.totalImages.toLocaleString(),
      subValue: `(${stats.newImages30Days.toLocaleString()} new 30 days)`,
      icon: IconPhoto,
      color: "blue",
    },
    {
      title: "Images Reviewed",
      value: stats.uniqueMediaIds.toLocaleString(),
      icon: IconEye,
      color: "green",
    },
    {
      title: "Volunteers",
      value: stats.totalVolunteers.toLocaleString(),
      icon: IconUsers,
      color: "grape",
    },
    {
      title: "Activity",
      value: Math.round(stats.totalObservationTime).toLocaleString(),
      subValue: "hrs",
      icon: IconClock,
      color: "teal",
    },
  ];

  return (
    <SimpleGrid cols={{ base: 2, sm: 4, md: 4, lg: 4 }} spacing={{ base: 6, sm: "md" }}>
      {scorecardData.map((item) => (
        <Card key={item.title} withBorder py={10} px={8} radius="sm">
          <Group justify="space-between" wrap="nowrap" gap={4}>
            <Text size="10px" c="dimmed" fw={700} tt="uppercase" style={{ lineHeight: 1, flex: 1 }} truncate="end">
              {item.title}
            </Text>
            <item.icon size={14} color={`var(--mantine-color-${item.color}-6)`} style={{ flexShrink: 0 }} />
          </Group>
          <Group align="baseline" gap={4} mt={8} wrap="nowrap">
            <Text size="md" fw={500} style={{ lineHeight: 1 }}>
              {item.value}
            </Text>
            {item.subValue && (
              <Text size="xs" c="dimmed" fw={500} style={{ lineHeight: 1 }}>
                {item.subValue}
              </Text>
            )}
          </Group>
        </Card>
      ))}
    </SimpleGrid>
  );
}
