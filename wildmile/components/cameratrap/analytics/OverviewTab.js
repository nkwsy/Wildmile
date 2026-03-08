"use client";

import { useState, useEffect, useMemo } from "react";
import {
  SimpleGrid,
  Card,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Loader,
  Center,
  Paper,
  Grid,
  ScrollArea,
  Tooltip,
  Box,
} from "@mantine/core";
import {
  IconPaw,
  IconCamera,
  IconEye,
  IconUsers,
  IconCalendar,
  IconTrendingUp,
} from "@tabler/icons-react";
import { BarChart, CompositeChart } from "@mantine/charts";

function CalendarHeatmap({ data }) {
  const { weeks, monthLabels, maxCount, dayLabels } = useMemo(() => {
    const dates = Object.keys(data).sort();
    if (!dates.length) return { weeks: [], monthLabels: [], maxCount: 1, dayLabels: [] };

    const first = new Date(dates[0]);
    const last = new Date(dates[dates.length - 1]);
    const max = Math.max(...Object.values(data), 1);

    const startDate = new Date(first);
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const endDate = new Date(last);
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));

    const wks = [];
    const mLabels = [];
    let current = new Date(startDate);
    let weekIdx = 0;
    let lastMonth = -1;

    while (current <= endDate) {
      const week = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = current.toISOString().split("T")[0];
        const inRange = current >= first && current <= last;
        week.push({
          date: dateStr,
          count: data[dateStr] || 0,
          inRange,
        });
        if (d === 0 && current.getMonth() !== lastMonth) {
          lastMonth = current.getMonth();
          mLabels.push({
            weekIdx,
            label: current.toLocaleString("default", { month: "short" }),
          });
        }
        current.setDate(current.getDate() + 1);
      }
      wks.push(week);
      weekIdx++;
    }

    return {
      weeks: wks,
      monthLabels: mLabels,
      maxCount: max,
      dayLabels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    };
  }, [data]);

  if (!weeks.length) return <Text c="dimmed">No calendar data</Text>;

  function getColor(count, inRange) {
    if (!inRange) return "transparent";
    if (count === 0) return "var(--mantine-color-gray-2)";
    const intensity = Math.min(count / maxCount, 1);
    const g = Math.round(120 + intensity * 135);
    return `rgb(30, ${g}, 90)`;
  }

  const cellSize = 13;
  const gap = 2;

  return (
    <Box>
      <Group gap={0} mb={2} ml={28}>
        {monthLabels.map((m, i) => (
          <Text
            key={i}
            size="xs"
            c="dimmed"
            style={{
              position: "relative",
              left: m.weekIdx * (cellSize + gap),
              whiteSpace: "nowrap",
            }}
          >
            {i === 0 || monthLabels[i - 1]?.weekIdx < m.weekIdx - 2
              ? m.label
              : ""}
          </Text>
        ))}
      </Group>
      <Group gap={0} align="flex-start" wrap="nowrap">
        <Stack gap={gap} mr={4}>
          {dayLabels.map((d, i) => (
            <Text
              key={d}
              size="xs"
              c="dimmed"
              h={cellSize}
              lh={`${cellSize}px`}
              style={{ visibility: i % 2 === 1 ? "visible" : "hidden" }}
            >
              {d}
            </Text>
          ))}
        </Stack>
        <Group gap={gap} align="flex-start" wrap="nowrap">
          {weeks.map((week, wi) => (
            <Stack key={wi} gap={gap}>
              {week.map((day) => (
                <Tooltip
                  key={day.date}
                  label={`${day.date}: ${day.count} observations`}
                  disabled={!day.inRange}
                >
                  <Box
                    w={cellSize}
                    h={cellSize}
                    style={{
                      borderRadius: 2,
                      backgroundColor: getColor(day.count, day.inRange),
                    }}
                  />
                </Tooltip>
              ))}
            </Stack>
          ))}
        </Group>
      </Group>
    </Box>
  );
}

function StatCard({ icon: Icon, color, label, value, subtitle }) {
  return (
    <Card withBorder padding="lg" radius="md">
      <Group justify="space-between">
        <Text fw={500} size="sm" c="dimmed">
          {label}
        </Text>
        <ThemeIcon color={color} variant="light" size="lg" radius="md">
          <Icon size={20} />
        </ThemeIcon>
      </Group>
      <Text fw={700} size="xl" mt="sm">
        {typeof value === "number" ? value.toLocaleString() : value}
      </Text>
      {subtitle && (
        <Text c="dimmed" size="xs" mt={4}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
}

export default function OverviewTab({ filters }) {
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
        if (filters.species?.length)
          params.set("species", filters.species.join(","));
        if (filters.deploymentId)
          params.set("deploymentId", filters.deploymentId);

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/overview?${params}`
        );
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Overview fetch error:", err);
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

  if (!data) {
    return (
      <Center py="xl">
        <Text c="dimmed">No data available</Text>
      </Center>
    );
  }

  const { stats, topSpecies, monthlyTrend, calendar } = data;

  const dateRange =
    stats.earliestDate && stats.latestDate
      ? `${new Date(stats.earliestDate).toLocaleDateString()} - ${new Date(stats.latestDate).toLocaleDateString()}`
      : "N/A";

  const topSpeciesChart = topSpecies.map((s) => ({
    species: s.commonName || s.species?.split(" ").slice(-1)[0] || s.species,
    Observations: s.count,
    fullName: s.commonName
      ? `${s.commonName} (${s.species})`
      : s.species,
  }));

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 3, lg: 5 }}>
        <StatCard
          icon={IconEye}
          color="blue"
          label="Total Observations"
          value={stats.totalObservations}
        />
        <StatCard
          icon={IconPaw}
          color="green"
          label="Unique Species"
          value={stats.uniqueSpecies}
        />
        <StatCard
          icon={IconCamera}
          color="orange"
          label="Media with Wildlife"
          value={stats.uniqueMedia}
        />
        <StatCard
          icon={IconUsers}
          color="grape"
          label="Total Individuals"
          value={stats.totalIndividuals}
        />
        <StatCard
          icon={IconCalendar}
          color="cyan"
          label="Date Range"
          value={dateRange}
        />
      </SimpleGrid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder padding="lg" radius="md">
            <Text fw={500} size="lg" mb="md">
              Top Species by Observation Count
            </Text>
            {topSpeciesChart.length > 0 ? (
              <BarChart
                h={350}
                data={topSpeciesChart}
                dataKey="species"
                series={[{ name: "Observations", color: "teal.6" }]}
                orientation="horizontal"
                withTooltip
                tooltipProps={{
                  content: ({ payload }) => {
                    if (!payload?.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <Paper p="xs" shadow="sm" withBorder>
                        <Text size="sm" fw={500}>
                          {d?.fullName}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {d?.Observations?.toLocaleString()} observations
                        </Text>
                      </Paper>
                    );
                  },
                }}
              />
            ) : (
              <Text c="dimmed">No species data</Text>
            )}
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder padding="lg" radius="md" h="100%">
            <Text fw={500} size="lg" mb="md">
              Observation Calendar
            </Text>
            <ScrollArea w="100%" type="auto" scrollbars="x">
              <CalendarHeatmap data={calendar} />
            </ScrollArea>
          </Card>
        </Grid.Col>
      </Grid>

      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={500} size="lg">
            Monthly Trends
          </Text>
          <ThemeIcon color="blue" variant="light" size="lg" radius="md">
            <IconTrendingUp size={20} />
          </ThemeIcon>
        </Group>
        {monthlyTrend.length > 0 ? (
          <ScrollArea w="100%" type="auto" scrollbars="x">
            <CompositeChart
              h={300}
              data={monthlyTrend}
              dataKey="month"
              series={[
                { name: "observations", color: "blue.6", type: "bar" },
                { name: "speciesCount", color: "green.6", type: "line" },
              ]}
              withLegend
              withTooltip
              yAxisLabel="Count"
            />
          </ScrollArea>
        ) : (
          <Text c="dimmed">No trend data</Text>
        )}
      </Card>
    </Stack>
  );
}
