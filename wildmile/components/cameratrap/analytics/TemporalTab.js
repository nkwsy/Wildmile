"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Grid,
  Tooltip,
  Box,
  ScrollArea,
  ThemeIcon,
  Select,
} from "@mantine/core";
import { IconClock, IconSun, IconMoon } from "@tabler/icons-react";
import { BarChart, LineChart } from "@mantine/charts";

function weekToMonthLabel(week) {
  const d = new Date(new Date().getFullYear(), 0, 1 + (week - 1) * 7);
  return d.toLocaleString("default", { month: "short" });
}

function HourWeekGrid({ matrix }) {
  const maxCount = Math.max(...matrix.map((c) => c.count), 1);
  const weeks = [...new Set(matrix.map((c) => c.week))].sort((a, b) => a - b);

  function getColor(count) {
    if (count === 0) return "var(--mantine-color-gray-2)";
    const intensity = Math.min(count / maxCount, 1);
    const g = Math.round(120 + intensity * 135);
    return `rgb(30, ${g}, 90)`;
  }

  // Build month markers for the header
  const monthMarkers = [];
  let lastMonth = "";
  weeks.forEach((w, i) => {
    const m = weekToMonthLabel(w);
    if (m !== lastMonth) {
      monthMarkers.push({ index: i, label: m });
      lastMonth = m;
    }
  });

  const cellSize = 14;
  const gap = 2;

  return (
    <Box>
      <Group gap={0} mb={2} ml={44} wrap="nowrap">
        {monthMarkers.map((m, i) => {
          const nextIdx =
            i + 1 < monthMarkers.length ? monthMarkers[i + 1].index : weeks.length;
          const span = nextIdx - m.index;
          return (
            <Text
              key={`${m.label}-${m.index}`}
              size="xs"
              c="dimmed"
              fw={500}
              style={{ width: span * (cellSize + gap), flexShrink: 0 }}
            >
              {span >= 3 ? m.label : ""}
            </Text>
          );
        })}
      </Group>
      {Array.from({ length: 24 }, (_, hour) => (
        <Group key={hour} gap={0} mb={0} wrap="nowrap">
          <Text
            size="xs"
            w={42}
            ta="right"
            c="dimmed"
            pr={4}
            lh={`${cellSize + gap}px`}
            style={{ flexShrink: 0 }}
          >
            {hour % 3 === 0 ? `${String(hour).padStart(2, "0")}:00` : ""}
          </Text>
          {weeks.map((week) => {
            const cell = matrix.find(
              (c) => c.hour === hour && c.week === week
            );
            const count = cell?.count || 0;
            return (
              <Tooltip
                key={`${hour}-${week}`}
                label={`Week ${week} (${weekToMonthLabel(week)}), ${String(hour).padStart(2, "0")}:00 — ${count} observations`}
              >
                <Box
                  style={{
                    width: cellSize,
                    height: cellSize,
                    flexShrink: 0,
                    marginRight: gap,
                    marginBottom: gap,
                    borderRadius: 2,
                    backgroundColor: getColor(count),
                    cursor: "pointer",
                  }}
                />
              </Tooltip>
            );
          })}
        </Group>
      ))}
      <Group gap="xs" mt="sm" justify="center">
        <Group gap={4}>
          <Box
            w={12}
            h={12}
            style={{
              borderRadius: 2,
              backgroundColor: "var(--mantine-color-gray-2)",
            }}
          />
          <Text size="xs" c="dimmed">None</Text>
        </Group>
        <Group gap={4}>
          <Box
            w={12}
            h={12}
            style={{ borderRadius: 2, backgroundColor: "rgb(30, 160, 90)" }}
          />
          <Text size="xs" c="dimmed">Low</Text>
        </Group>
        <Group gap={4}>
          <Box
            w={12}
            h={12}
            style={{ borderRadius: 2, backgroundColor: "rgb(30, 210, 90)" }}
          />
          <Text size="xs" c="dimmed">Medium</Text>
        </Group>
        <Group gap={4}>
          <Box
            w={12}
            h={12}
            style={{ borderRadius: 2, backgroundColor: "rgb(30, 255, 90)" }}
          />
          <Text size="xs" c="dimmed">High</Text>
        </Group>
      </Group>
    </Box>
  );
}

export default function TemporalTab({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDielSpecies, setSelectedDielSpecies] = useState(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.startDate)
          params.set("startDate", filters.startDate.toISOString());
        if (filters.endDate)
          params.set("endDate", filters.endDate.toISOString());
        if (filters.species?.length)
          params.set("species", filters.species.join(","));
        if (filters.deploymentId)
          params.set("deploymentId", filters.deploymentId);

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/temporal?${params}`
        );
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Temporal fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [filters]);

  const dielChartData = useMemo(() => {
    if (!data?.dielCurves?.length) return [];
    const curves = selectedDielSpecies
      ? data.dielCurves.filter((c) => c.species === selectedDielSpecies)
      : data.dielCurves.slice(0, 4);

    const hours = Array.from({ length: 24 }, (_, i) => {
      const point = { hour: `${String(i).padStart(2, "0")}:00` };
      curves.forEach((c) => {
        const label = c.commonName || c.species;
        const h = c.data.find((d) => d.hour === i);
        point[label] = h?.count || 0;
      });
      return point;
    });
    return {
      hours,
      series: curves.map((c) => c.commonName || c.species),
    };
  }, [data, selectedDielSpecies]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  if (!data) {
    return (
      <Center py="xl">
        <Text c="dimmed">No temporal data available</Text>
      </Center>
    );
  }

  const { matrix, seasonal } = data;

  // Compute day vs night summary
  const dayObs = matrix
    .filter((c) => c.hour >= 6 && c.hour < 18)
    .reduce((s, c) => s + c.count, 0);
  const nightObs = matrix
    .filter((c) => c.hour < 6 || c.hour >= 18)
    .reduce((s, c) => s + c.count, 0);
  const totalObs = dayObs + nightObs;

  const colors = [
    "blue.6",
    "green.6",
    "orange.6",
    "grape.6",
    "cyan.6",
    "red.6",
    "teal.6",
    "pink.6",
  ];

  return (
    <Stack gap="md">
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={500} size="lg">
            Activity Heatmap: Hour of Day x Week of Year
          </Text>
          <ThemeIcon color="teal" variant="light" size="lg" radius="md">
            <IconClock size={20} />
          </ThemeIcon>
        </Group>
        <ScrollArea w="100%" type="auto" scrollbars="x">
          <HourWeekGrid matrix={matrix} />
        </ScrollArea>
      </Card>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 4 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Group justify="space-between">
              <Text fw={500}>Day vs Night</Text>
              <Group gap="xs">
                <ThemeIcon color="yellow" variant="light" size="sm">
                  <IconSun size={14} />
                </ThemeIcon>
                <ThemeIcon color="indigo" variant="light" size="sm">
                  <IconMoon size={14} />
                </ThemeIcon>
              </Group>
            </Group>
            <Stack mt="md" gap="xs">
              <Group justify="space-between">
                <Text size="sm">Daytime (6am-6pm)</Text>
                <Text fw={600}>
                  {dayObs.toLocaleString()} (
                  {totalObs ? Math.round((dayObs / totalObs) * 100) : 0}%)
                </Text>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Nighttime (6pm-6am)</Text>
                <Text fw={600}>
                  {nightObs.toLocaleString()} (
                  {totalObs ? Math.round((nightObs / totalObs) * 100) : 0}%)
                </Text>
              </Group>
              <Text size="xs" c="dimmed" mt="sm">
                {dayObs > nightObs
                  ? "Wildlife at this site is predominantly diurnal."
                  : nightObs > dayObs
                    ? "Wildlife at this site is predominantly nocturnal."
                    : "Activity is evenly split between day and night."}
              </Text>
            </Stack>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 8 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Text fw={500} size="lg" mb="md">
              Seasonal Activity
            </Text>
            {seasonal.length > 0 ? (
              <BarChart
                h={300}
                data={seasonal}
                dataKey="month"
                series={[{ name: "total", color: "blue.6" }]}
                withTooltip
                withLegend={false}
                yAxisLabel="Observations"
              />
            ) : (
              <Text c="dimmed">No seasonal data</Text>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={500} size="lg">
            Diel Activity by Species
          </Text>
          {data.dielCurves?.length > 0 && (
            <Select
              placeholder="All top species"
              data={data.dielCurves.map((c) => ({
                value: c.species,
                label: c.commonName
                  ? `${c.commonName} (${c.species})`
                  : c.species,
              }))}
              value={selectedDielSpecies}
              onChange={setSelectedDielSpecies}
              clearable
              searchable
              size="xs"
              w={250}
            />
          )}
        </Group>
        {dielChartData.hours?.length > 0 ? (
          <LineChart
            h={300}
            data={dielChartData.hours}
            dataKey="hour"
            series={dielChartData.series.map((s, i) => ({
              name: s,
              color: colors[i % colors.length],
            }))}
            withLegend
            withTooltip
            curveType="natural"
            yAxisLabel="Observations"
            xAxisLabel="Hour of Day"
          />
        ) : (
          <Text c="dimmed">No diel activity data</Text>
        )}
      </Card>
    </Stack>
  );
}
