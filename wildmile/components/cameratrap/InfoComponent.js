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
// import { getStats } from "/actions/CameratrapActions";
import { getStats } from "app/actions/CameratrapActions";
import { Suspense } from "react";
/**
 * Server-side data fetch
 */
async function fetchStats(force = false) {
  const url = "/api/cameratrap/getStats";

  // const response = await fetch(url, {
  //   cache: force ? "no-store" : "force-cache", // or use { next: { revalidate: 60 } }
  // });
  const response = await fetch(url);
  console.log(response);
  const stats = await response.json();
  return stats;
}

/**
 * Server Component
 * Suspense boundaries and error boundaries will come from the parent route usage
 */
export default async function InfoComponent({ force = false }) {
  // Server fetch
  const stats = await getStats();

  // // If stats is null or something else, you can handle it here or let it throw
  // if (!stats) {
  //   return (
  //     <Paper p="md" shadow="xs">
  //       <Text color="red">Unable to load statistics</Text>
  //     </Paper>
  //   );
  // }

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
              {stats.uniqueMediaIds.toLocaleString()}
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