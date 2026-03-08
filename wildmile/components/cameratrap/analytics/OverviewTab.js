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

const MONTH_LABELS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function YearMonthHeatmap({ data }) {
  const { grid, years, maxCount } = useMemo(() => {
    const buckets = {};
    Object.entries(data).forEach(([date, count]) => {
      const [y, m] = date.split("-");
      const key = `${y}-${m}`;
      buckets[key] = (buckets[key] || 0) + count;
    });

    const allYears = [
      ...new Set(Object.keys(buckets).map((k) => k.split("-")[0])),
    ].sort();
    const max = Math.max(...Object.values(buckets), 1);

    const g = {};
    allYears.forEach((yr) => {
      g[yr] = Array.from({ length: 12 }, (_, i) => {
        const m = String(i + 1).padStart(2, "0");
        return buckets[`${yr}-${m}`] || 0;
      });
    });

    return { grid: g, years: allYears, maxCount: max };
  }, [data]);

  if (!years.length) return <Text c="dimmed">No calendar data</Text>;

  function getColor(count) {
    if (count === 0) return "var(--mantine-color-gray-2)";
    const intensity = Math.min(count / maxCount, 1);
    const g = Math.round(120 + intensity * 135);
    return `rgb(30, ${g}, 90)`;
  }

  return (
    <Box>
      <Group gap={2} mb={4} ml={38}>
        {MONTH_LABELS.map((m) => (
          <Text
            key={m}
            size="xs"
            c="dimmed"
            ta="center"
            fw={500}
            style={{ flex: 1, minWidth: 0 }}
          >
            {m}
          </Text>
        ))}
      </Group>
      {years.map((yr) => (
        <Group key={yr} gap={2} mb={2} wrap="nowrap">
          <Text size="xs" c="dimmed" w={36} ta="right" fw={500} pr={2}>
            {yr}
          </Text>
          {grid[yr].map((count, mi) => (
            <Tooltip
              key={mi}
              label={`${MONTH_LABELS[mi]} ${yr}: ${count.toLocaleString()} observations`}
            >
              <Box
                style={{
                  flex: 1,
                  minWidth: 0,
                  height: 24,
                  borderRadius: 3,
                  backgroundColor: getColor(count),
                  cursor: "pointer",
                }}
              />
            </Tooltip>
          ))}
        </Group>
      ))}
      <Group gap="xs" mt="xs" justify="center">
        {[
          { color: "var(--mantine-color-gray-2)", label: "None" },
          { color: "rgb(30, 160, 90)", label: "Low" },
          { color: "rgb(30, 210, 90)", label: "Med" },
          { color: "rgb(30, 255, 90)", label: "High" },
        ].map((item) => (
          <Group key={item.label} gap={4}>
            <Box
              w={10}
              h={10}
              style={{ borderRadius: 2, backgroundColor: item.color }}
            />
            <Text size="xs" c="dimmed">
              {item.label}
            </Text>
          </Group>
        ))}
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
            <YearMonthHeatmap data={calendar} />
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
