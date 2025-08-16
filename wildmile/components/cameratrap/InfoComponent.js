"use server";
import React from "react";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Card,
  Grid,
  GridCol,
  Divider,
} from "@mantine/core";
import { UserAvatar } from "/components/shared/UserAvatar";
import { Suspense } from "react";

/**
 * Server Component
 * Suspense boundaries and error boundaries will come from the parent route usage
 */
export default async function InfoComponent({ force = false }) {
  // Server fetch using the API route
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/cameratrap/getStats`);
  const stats = await response.json();

  return (
    <Stack spacing="lg">
      <Group position="apart">
        <Title order={3}>Camera Trap Statistics</Title>
        {/* 
          In a Server Component, you can't directly do onClick to re-fetch.
          Instead, consider a server action or a Next.js Link that sets "?force=true"
          in the URL, causing a new fetch on page load. Example:
          
          <Link href="/cameratrap?force=true">Refresh</Link>
        */}
      </Group>

      <Grid>
        <GridCol span={4}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" weight={500}>
              Total Images
            </Text>
            <Text size="xl" weight={700} mt="sm">
              {stats.totalImages.toLocaleString()}
            </Text>
          </Card>
        </GridCol>
        <GridCol span={4}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" weight={500}>
              Images with Observations
            </Text>
            <Text size="xl" weight={700} mt="sm">
              {stats.totalImagesWithObservations.toLocaleString()}
            </Text>
          </Card>
        </GridCol>
        <GridCol span={4}>
          <Card withBorder p="md">
            <Text size="sm" color="dimmed" weight={500}>
              New Images (30 days)
            </Text>
            <Text size="xl" weight={700} mt="sm">
              {stats.newImages30Days.toLocaleString()}
            </Text>
          </Card>
        </GridCol>
      </Grid>

      <Card withBorder>
        <Group position="apart" mb="md">
          <Text size="md" weight={500}>
            Top Observers
          </Text>
        </Group>

        <Suspense fallback={<div>Loading...</div>}>
          {stats.topCreators.length > 0 ? (
            <Stack spacing="xs">
              {stats.topCreators.map((creator, index) => (
                <Group key={creator.id || index} position="apart">
                  <UserAvatar userId={creator.id} />
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
        </Suspense>
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
  );
}
