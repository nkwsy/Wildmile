"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Tooltip,
  Box,
  ScrollArea,
  Paper,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";

function CoOccurrenceMatrix({ matrix, speciesOrder, commonNames = {} }) {
  if (!speciesOrder?.length) return <Text c="dimmed">No data</Text>;

  const allValues = [];
  speciesOrder.forEach((a) =>
    speciesOrder.forEach((b) => {
      if (a !== b && matrix[a]?.[b]) allValues.push(matrix[a][b]);
    })
  );
  const maxVal = Math.max(...allValues, 1);

  function getColor(val, isSelf) {
    if (isSelf) return "var(--mantine-color-dark-4)";
    if (val === 0) return "var(--mantine-color-dark-7)";
    const intensity = Math.min(val / maxVal, 1);
    const r = Math.round(30 + intensity * 20);
    const g = Math.round(100 + intensity * 155);
    const b = Math.round(180 + intensity * 75);
    return `rgb(${r}, ${g}, ${b})`;
  }

  const displayName = (s) => commonNames[s] || s;
  const shortName = (s) => {
    if (commonNames[s]) return commonNames[s];
    const parts = s.split(" ");
    return parts.length > 1
      ? `${parts[0][0]}. ${parts.slice(1).join(" ")}`
      : s;
  };

  const cellSize = 40;

  return (
    <ScrollArea w="100%" type="auto" scrollbars="xy">
      <Box style={{ display: "inline-block" }}>
        <Group gap={0}>
          <Box w={120} />
          {speciesOrder.map((s) => (
            <Tooltip key={s} label={s}>
              <Text
                size="xs"
                ta="center"
                w={cellSize}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  writingMode: "vertical-rl",
                  transform: "rotate(180deg)",
                  height: 100,
                }}
              >
                {shortName(s)}
              </Text>
            </Tooltip>
          ))}
        </Group>
        {speciesOrder.map((rowSpecies) => (
          <Group key={rowSpecies} gap={0}>
            <Tooltip label={rowSpecies}>
              <Text
                size="xs"
                w={120}
                style={{
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
                pr="xs"
                ta="right"
              >
                {shortName(rowSpecies)}
              </Text>
            </Tooltip>
            {speciesOrder.map((colSpecies) => {
              const val = matrix[rowSpecies]?.[colSpecies] || 0;
              const isSelf = rowSpecies === colSpecies;
              return (
                <Tooltip
                  key={colSpecies}
                  label={
                    isSelf
                      ? `${displayName(rowSpecies)}: ${val} total media`
                      : `${displayName(rowSpecies)} + ${displayName(colSpecies)}: ${val} shared media`
                  }
                >
                  <Box
                    w={cellSize}
                    h={cellSize}
                    style={{
                      backgroundColor: getColor(val, isSelf),
                      borderRadius: 2,
                      margin: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                    }}
                  >
                    {val > 0 && (
                      <Text size="xs" c="white" fw={500}>
                        {val}
                      </Text>
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Group>
        ))}
      </Box>
    </ScrollArea>
  );
}

export default function CoOccurrenceTab({ filters }) {
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
        if (filters.deploymentId)
          params.set("deploymentId", filters.deploymentId);

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/co-occurrence?${params}`
        );
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Co-occurrence fetch error:", err);
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
        <Text c="dimmed">No co-occurrence data available</Text>
      </Center>
    );
  }

  const cn = data.commonNames || {};
  const pairsChart = (data.pairs || []).slice(0, 15).map((p) => {
    const nameA = p.commonNameA || p.speciesA.split(" ").pop();
    const nameB = p.commonNameB || p.speciesB.split(" ").pop();
    return {
      pair: `${nameA} + ${nameB}`,
      "Shared Media": p.count,
      fullLabel: p.commonNameA && p.commonNameB
        ? `${p.commonNameA} (${p.speciesA}) + ${p.commonNameB} (${p.speciesB})`
        : `${p.speciesA} + ${p.speciesB}`,
      jaccard: p.jaccard,
    };
  });

  return (
    <Stack gap="md">
      <Card withBorder padding="lg" radius="md">
        <Text fw={500} size="lg" mb="md">
          Species Co-occurrence Matrix
        </Text>
        <Text size="sm" c="dimmed" mb="md">
          Shows how often species are observed on the same camera trap image.
          Diagonal cells show total media per species.
        </Text>
        <CoOccurrenceMatrix
          matrix={data.matrix}
          speciesOrder={data.speciesOrder}
          commonNames={cn}
        />
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} size="lg" mb="md">
          Top Co-occurring Species Pairs
        </Text>
        {pairsChart.length > 0 ? (
          <BarChart
            h={400}
            data={pairsChart}
            dataKey="pair"
            series={[{ name: "Shared Media", color: "cyan.6" }]}
            orientation="horizontal"
            withTooltip
            tooltipProps={{
              content: ({ payload }) => {
                if (!payload?.length) return null;
                const d = payload[0]?.payload;
                return (
                  <Paper p="xs" shadow="sm" withBorder>
                    <Text size="sm" fw={500}>
                      {d?.fullLabel}
                    </Text>
                    <Text size="xs">
                      Shared media: {d?.["Shared Media"]}
                    </Text>
                    <Text size="xs" c="dimmed">
                      Jaccard index: {d?.jaccard}
                    </Text>
                  </Paper>
                );
              },
            }}
          />
        ) : (
          <Text c="dimmed">
            No co-occurring species pairs found. This may mean each image
            contains only one species.
          </Text>
        )}
      </Card>
    </Stack>
  );
}
