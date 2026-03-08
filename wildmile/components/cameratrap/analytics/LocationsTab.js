"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Grid,
  Badge,
  ThemeIcon,
  SimpleGrid,
  ScrollArea,
  Paper,
  Progress,
} from "@mantine/core";
import { IconMapPin, IconPaw, IconChartBar } from "@tabler/icons-react";
import { BarChart } from "@mantine/charts";

export default function LocationsTab({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.startDate)
          params.set("startDate", filters.startDate.toISOString());
        if (filters.endDate)
          params.set("endDate", filters.endDate.toISOString());

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/locations?${params}`
        );
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Locations fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!data?.locations?.length) {
    return (
      <Center py="xl">
        <Text c="dimmed">No location data available</Text>
      </Center>
    );
  }

  const { locations } = data;

  const observationChart = locations.slice(0, 20).map((l) => ({
    location: l.locationName,
    Observations: l.totalObservations,
  }));

  const diversityChart = locations
    .filter((l) => l.shannonDiversity > 0)
    .slice(0, 20)
    .map((l) => ({
      location: l.locationName,
      "Shannon Diversity": l.shannonDiversity,
    }));

  const speciesChart = locations.slice(0, 20).map((l) => ({
    location: l.locationName,
    "Species Count": l.speciesCount,
  }));

  const maxObs = Math.max(...locations.map((l) => l.totalObservations), 1);

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text fw={500}>Total Locations</Text>
            <ThemeIcon color="blue" variant="light" size="lg" radius="md">
              <IconMapPin size={20} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="xl" mt="sm">
            {locations.length}
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text fw={500}>Most Active</Text>
            <ThemeIcon color="green" variant="light" size="lg" radius="md">
              <IconChartBar size={20} />
            </ThemeIcon>
          </Group>
          <Text fw={700} size="lg" mt="sm">
            {locations[0]?.locationName}
          </Text>
          <Text size="sm" c="dimmed">
            {locations[0]?.totalObservations.toLocaleString()} observations
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Group justify="space-between">
            <Text fw={500}>Most Diverse</Text>
            <ThemeIcon color="grape" variant="light" size="lg" radius="md">
              <IconPaw size={20} />
            </ThemeIcon>
          </Group>
          {(() => {
            const mostDiverse = [...locations].sort(
              (a, b) => b.shannonDiversity - a.shannonDiversity
            )[0];
            return (
              <>
                <Text fw={700} size="lg" mt="sm">
                  {mostDiverse?.locationName}
                </Text>
                <Text size="sm" c="dimmed">
                  Shannon H&apos; = {mostDiverse?.shannonDiversity}
                </Text>
              </>
            );
          })()}
        </Card>
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} size="lg" mb="md">
              Observations by Location
            </Text>
            <ScrollArea h={400} type="auto">
              <BarChart
                h={Math.max(300, observationChart.length * 30)}
                data={observationChart}
                dataKey="location"
                series={[{ name: "Observations", color: "blue.6" }]}
                orientation="horizontal"
                withTooltip
                withLegend={false}
              />
            </ScrollArea>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} size="lg" mb="md">
              Shannon Diversity Index by Location
            </Text>
            <ScrollArea h={400} type="auto">
              <BarChart
                h={Math.max(300, diversityChart.length * 30)}
                data={diversityChart}
                dataKey="location"
                series={[{ name: "Shannon Diversity", color: "grape.6" }]}
                orientation="horizontal"
                withTooltip
                withLegend={false}
              />
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} size="lg" mb="md">
          Species Richness by Location
        </Text>
        <ScrollArea h={400} type="auto">
          <BarChart
            h={Math.max(300, speciesChart.length * 30)}
            data={speciesChart}
            dataKey="location"
            series={[{ name: "Species Count", color: "teal.6" }]}
            orientation="horizontal"
            withTooltip
            withLegend={false}
          />
        </ScrollArea>
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} size="lg" mb="md">
          Location Details
        </Text>
        <Stack gap="sm">
          {locations.map((loc) => (
            <Paper key={loc.locationName} p="sm" withBorder radius="md">
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <ThemeIcon
                    color="blue"
                    variant="light"
                    size="sm"
                    radius="xl"
                  >
                    <IconMapPin size={12} />
                  </ThemeIcon>
                  <Text fw={500}>{loc.locationName}</Text>
                </Group>
                <Group gap="xs">
                  <Badge color="blue" variant="light" size="sm">
                    {loc.totalObservations} obs
                  </Badge>
                  <Badge color="green" variant="light" size="sm">
                    {loc.speciesCount} species
                  </Badge>
                  <Badge color="grape" variant="light" size="sm">
                    H&apos; = {loc.shannonDiversity}
                  </Badge>
                </Group>
              </Group>
              <Progress
                value={(loc.totalObservations / maxObs) * 100}
                size="sm"
                color="blue"
                radius="xl"
                mb="xs"
              />
              <Group gap="xs">
                {loc.topSpecies?.slice(0, 5).map((s) => (
                  <Badge key={s.name} size="xs" variant="dot">
                    {s.commonName || s.name}: {s.count}
                  </Badge>
                ))}
              </Group>
            </Paper>
          ))}
        </Stack>
      </Card>
    </Stack>
  );
}
