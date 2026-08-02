"use client";
import React from "react";
import {
  Text,
  Group,
  Stack,
  Divider,
  Box,
  Fieldset,
} from "@mantine/core";
import { UserAvatar } from "/components/shared/UserAvatar";

export function Leaderboard({ stats }) {
  return (
    <Fieldset legend="Leaderboard">
        {stats.topCreators && stats.topCreators.length > 0 ? (
          <Stack gap="xs">
            {stats.topCreators.map((creator, index) => (
              <Group key={creator.id || index} justify="space-between" wrap="nowrap">
                <Group gap="sm" wrap="nowrap" style={{ flex: 1, minWidth: 0 }}>
                  <Text size="sm" fw={700} w={20}>{index + 1}.</Text>
                  <UserAvatar userId={creator.id || creator.name} />
                </Group>
                <Text size="sm" c="dimmed" style={{ flexShrink: 0 }}>
                  {creator.count.toLocaleString()} obs
                </Text>
              </Group>
            ))}
          </Stack>
        ) : (
          <Text size="sm" c="dimmed" fs="italic">
            No observations recorded yet
          </Text>
        )}

        <Divider my="md" />

        <Stack gap="sm">
          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" fw={500} style={{ flexShrink: 0 }}>
              Most Active (7 days)
            </Text>
            <Box style={{ textAlign: "right", minWidth: 0 }}>
              <Text size="sm" c="dimmed" truncate="end">
                {stats.mostActive7Days?.name || "No activity"}
              </Text>
              {stats.mostActive7Days?.count > 0 && (
                <Text size="xs" c="dimmed">
                  ({stats.mostActive7Days.count.toLocaleString()} obs)
                </Text>
              )}
            </Box>
          </Group>

          <Group justify="space-between" wrap="nowrap">
            <Text size="sm" fw={500} style={{ flexShrink: 0 }}>
              Most Blanks Logged
            </Text>
            <Box style={{ textAlign: "right", minWidth: 0 }}>
              <Text size="sm" c="dimmed" truncate="end">
                {stats.mostBlanks?.name || "No blanks"}
              </Text>
              {stats.mostBlanks?.count > 0 && (
                <Text size="xs" c="dimmed">
                  ({stats.mostBlanks.count.toLocaleString()})
                </Text>
              )}
            </Box>
          </Group>
        </Stack>
    </Fieldset>
  );
}
