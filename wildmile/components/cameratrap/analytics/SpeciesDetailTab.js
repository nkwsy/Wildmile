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
  Select,
  SimpleGrid,
  ThemeIcon,
  Badge,
  ScrollArea,
  Paper,
} from "@mantine/core";
import {
  IconPaw,
  IconCalendar,
  IconCamera,
  IconHash,
  IconDiamond,
  IconChartDonut,
} from "@tabler/icons-react";
import { BarChart, PieChart, LineChart } from "@mantine/charts";

function RaritySection({ filters }) {
  const [rarity, setRarity] = useState(null);
  const [rarityLoading, setRarityLoading] = useState(true);

  useEffect(() => {
    async function fetchRarity() {
      setRarityLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.startDate)
          params.set("startDate", filters.startDate.toISOString());
        if (filters.endDate)
          params.set("endDate", filters.endDate.toISOString());
        if (filters.deploymentId)
          params.set("deploymentId", filters.deploymentId);

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/rarity?${params}`
        );
        if (res.ok) setRarity(await res.json());
      } catch (err) {
        console.error("Rarity fetch error:", err);
      } finally {
        setRarityLoading(false);
      }
    }
    fetchRarity();
  }, [filters]);

  if (rarityLoading) {
    return (
      <Center py="md">
        <Loader size="sm" />
      </Center>
    );
  }

  if (!rarity) return null;

  const { diversity, species } = rarity;

  return (
    <Stack gap="md">
      <SimpleGrid cols={{ base: 2, sm: 4, lg: 7 }}>
        <Card withBorder padding="md" radius="md">
          <Text size="xs" c="dimmed">Total Species</Text>
          <Text fw={700} size="lg">{diversity.totalSpecies}</Text>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Text size="xs" c="dimmed">Total Observations</Text>
          <Text fw={700} size="lg">{diversity.totalObservations.toLocaleString()}</Text>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Text size="xs" c="dimmed">Shannon Index (H&apos;)</Text>
          <Text fw={700} size="lg">{diversity.shannonIndex}</Text>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Text size="xs" c="dimmed">Simpson&apos;s Index</Text>
          <Text fw={700} size="lg">{diversity.simpsonsIndex}</Text>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Text size="xs" c="dimmed">Evenness (J)</Text>
          <Text fw={700} size="lg">{diversity.evenness}</Text>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Text size="xs" c="dimmed">Rare Species</Text>
          <Text fw={700} size="lg" c="orange">{diversity.rareSpeciesCount}</Text>
        </Card>
        <Card withBorder padding="md" radius="md">
          <Text size="xs" c="dimmed">Singletons</Text>
          <Text fw={700} size="lg" c="red">{diversity.singletonCount}</Text>
        </Card>
      </SimpleGrid>

      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Text fw={500} size="lg">Species Rarity Index</Text>
          <Group gap="xs">
            <Badge color="red" variant="light" size="sm">Singleton</Badge>
            <Badge color="orange" variant="light" size="sm">Rare</Badge>
            <Badge color="blue" variant="light" size="sm">Common</Badge>
          </Group>
        </Group>
        <ScrollArea h={400} type="auto">
          <Stack gap="xs">
            {species.map((s) => (
              <Paper key={s.species} p="xs" withBorder radius="sm">
                <Group justify="space-between">
                  <Group gap="xs">
                    <ThemeIcon
                      color={s.isSingleton ? "red" : s.isRare ? "orange" : "blue"}
                      variant="light"
                      size="sm"
                      radius="xl"
                    >
                      {s.isSingleton ? (
                        <IconDiamond size={12} />
                      ) : (
                        <IconPaw size={12} />
                      )}
                    </ThemeIcon>
                    <div>
                      <Text size="sm" fw={500}>
                        {s.commonName || s.species}
                      </Text>
                      {s.commonName && (
                        <Text size="xs" c="dimmed" fs="italic">
                          {s.species}
                        </Text>
                      )}
                    </div>
                  </Group>
                  <Group gap="xs">
                    <Badge size="xs" variant="light">
                      {s.observationCount} obs
                    </Badge>
                    <Badge size="xs" variant="light" color="green">
                      {s.relativeAbundance}%
                    </Badge>
                    <Badge size="xs" variant="light" color="cyan">
                      {s.mediaCount} media
                    </Badge>
                    <Badge size="xs" variant="light" color="grape">
                      {s.locationCount} locations
                    </Badge>
                  </Group>
                </Group>
              </Paper>
            ))}
          </Stack>
        </ScrollArea>
      </Card>
    </Stack>
  );
}

function StatCard({ icon: Icon, color, label, value }) {
  return (
    <Card withBorder padding="md" radius="md">
      <Group justify="space-between">
        <Text size="sm" c="dimmed">
          {label}
        </Text>
        <ThemeIcon color={color} variant="light" size="md" radius="md">
          <Icon size={16} />
        </ThemeIcon>
      </Group>
      <Text fw={700} size="lg" mt="xs">
        {value}
      </Text>
    </Card>
  );
}

export default function SpeciesDetailTab({ filters }) {
  const [speciesList, setSpeciesList] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    async function fetchList() {
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
          `/api/cameratrap/analytics/wildlife/species-detail?${params}`
        );
        if (res.ok) {
          const data = await res.json();
          setSpeciesList(data.speciesList || []);
        }
      } catch (err) {
        console.error("Species list fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchList();
  }, [filters]);

  useEffect(() => {
    if (!selectedSpecies) {
      setDetail(null);
      return;
    }
    async function fetchDetail() {
      setDetailLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("species", selectedSpecies);
        if (filters.startDate)
          params.set("startDate", filters.startDate.toISOString());
        if (filters.endDate)
          params.set("endDate", filters.endDate.toISOString());
        if (filters.deploymentId)
          params.set("deploymentId", filters.deploymentId);

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/species-detail?${params}`
        );
        if (res.ok) setDetail(await res.json());
      } catch (err) {
        console.error("Species detail fetch error:", err);
      } finally {
        setDetailLoading(false);
      }
    }
    fetchDetail();
  }, [selectedSpecies, filters]);

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  const selectData = speciesList.map((s) => ({
    value: s.species,
    label: s.commonName
      ? `${s.commonName} — ${s.species} (${s.count} obs)`
      : `${s.species} (${s.count} obs)`,
  }));

  return (
    <Stack gap="md">
      <Card withBorder padding="lg" radius="md">
        <Select
          label="Select a species to analyze"
          placeholder="Choose species..."
          data={selectData}
          value={selectedSpecies}
          onChange={setSelectedSpecies}
          searchable
          clearable
          size="md"
        />
      </Card>

      {detailLoading && (
        <Center py="xl">
          <Loader />
        </Center>
      )}

      {!selectedSpecies && !detailLoading && (
        <>
          <Card withBorder padding="lg" radius="md">
            <Group gap="sm" mb="md">
              <ThemeIcon color="grape" variant="light" size="lg" radius="md">
                <IconChartDonut size={20} />
              </ThemeIcon>
              <div>
                <Text fw={500} size="lg">
                  Biodiversity Metrics & Rarity Index
                </Text>
                <Text size="sm" c="dimmed">
                  Select a species above for detailed analysis, or browse
                  rarity metrics below
                </Text>
              </div>
            </Group>
          </Card>
          <RaritySection filters={filters} />
        </>
      )}

      {detail && !detailLoading && (
        <>
          <SimpleGrid cols={{ base: 2, sm: 4 }}>
            <StatCard
              icon={IconPaw}
              color="green"
              label="Total Observations"
              value={detail.stats?.totalObservations?.toLocaleString() || "0"}
            />
            <StatCard
              icon={IconHash}
              color="grape"
              label="Total Individuals"
              value={detail.stats?.totalIndividuals?.toLocaleString() || "0"}
            />
            <StatCard
              icon={IconCamera}
              color="orange"
              label="Unique Media"
              value={detail.stats?.uniqueMedia?.toLocaleString() || "0"}
            />
            <StatCard
              icon={IconCalendar}
              color="cyan"
              label="Avg Group Size"
              value={detail.stats?.avgCount || "N/A"}
            />
          </SimpleGrid>

          {detail.stats?.firstSeen && (
            <Group gap="md">
              <Badge color="green" size="lg" variant="light">
                First seen:{" "}
                {new Date(detail.stats.firstSeen).toLocaleDateString()}
              </Badge>
              <Badge color="blue" size="lg" variant="light">
                Last seen:{" "}
                {new Date(detail.stats.lastSeen).toLocaleDateString()}
              </Badge>
            </Group>
          )}

          <Grid>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder padding="lg" radius="md">
                <Text fw={500} size="lg" mb="md">
                  Duration of Stay
                </Text>
                {detail.duration?.length > 0 ? (
                  <BarChart
                    h={280}
                    data={detail.duration}
                    dataKey="label"
                    series={[{ name: "count", color: "violet.6" }]}
                    withTooltip
                    withLegend={false}
                    yAxisLabel="Observations"
                    xAxisLabel="Duration"
                  />
                ) : (
                  <Text c="dimmed">No duration data</Text>
                )}
              </Card>
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder padding="lg" radius="md">
                <Text fw={500} size="lg" mb="md">
                  Demographics
                </Text>
                <Grid>
                  {detail.demographics?.lifeStage?.length > 0 && (
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500} mb="xs">
                        Life Stage
                      </Text>
                      <PieChart
                        h={180}
                        data={detail.demographics.lifeStage.map((l) => ({
                          name: l._id,
                          value: l.count,
                          color:
                            l._id === "adult"
                              ? "blue.6"
                              : l._id === "juvenile"
                                ? "green.6"
                                : "orange.6",
                        }))}
                        withTooltip
                        withLabelsLine
                        labelsType="percent"
                      />
                    </Grid.Col>
                  )}
                  {detail.demographics?.sex?.length > 0 && (
                    <Grid.Col span={6}>
                      <Text size="sm" fw={500} mb="xs">
                        Sex
                      </Text>
                      <PieChart
                        h={180}
                        data={detail.demographics.sex.map((s) => ({
                          name: s._id,
                          value: s.count,
                          color:
                            s._id === "male"
                              ? "blue.6"
                              : s._id === "female"
                                ? "pink.6"
                                : "gray.6",
                        }))}
                        withTooltip
                        withLabelsLine
                        labelsType="percent"
                      />
                    </Grid.Col>
                  )}
                </Grid>
                {detail.demographics?.behavior?.length > 0 && (
                  <Stack mt="md" gap="xs">
                    <Text size="sm" fw={500}>
                      Behaviors
                    </Text>
                    <Group gap="xs">
                      {detail.demographics.behavior.map((b) => (
                        <Badge key={b._id} variant="light">
                          {b._id}: {b.count}
                        </Badge>
                      ))}
                    </Group>
                  </Stack>
                )}
                {!detail.demographics?.lifeStage?.length &&
                  !detail.demographics?.sex?.length &&
                  !detail.demographics?.behavior?.length && (
                    <Text c="dimmed">No demographic data recorded</Text>
                  )}
              </Card>
            </Grid.Col>
          </Grid>

          <Card withBorder padding="lg" radius="md">
            <Text fw={500} size="lg" mb="md">
              Observation Timeline
            </Text>
            {detail.timeline?.length > 0 ? (
              <ScrollArea w="100%" type="auto" scrollbars="x">
                <LineChart
                  h={280}
                  data={detail.timeline}
                  dataKey="month"
                  series={[
                    { name: "count", color: "blue.6" },
                    { name: "individuals", color: "green.6" },
                  ]}
                  withLegend
                  withTooltip
                  curveType="monotone"
                  yAxisLabel="Count"
                />
              </ScrollArea>
            ) : (
              <Text c="dimmed">No timeline data</Text>
            )}
          </Card>
        </>
      )}
    </Stack>
  );
}
