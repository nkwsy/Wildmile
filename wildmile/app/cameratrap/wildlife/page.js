"use client";

import { useState } from "react";
import {
  Tabs,
  Title,
  Text,
  Group,
  ThemeIcon,
  Stack,
  Container,
} from "@mantine/core";
import {
  IconChartBar,
  IconClock,
  IconPaw,
  IconArrowsShuffle,
  IconMapPin,
  IconDownload,
} from "@tabler/icons-react";
import WildlifeAnalyticsFilters from "components/cameratrap/analytics/WildlifeAnalyticsFilters";
import OverviewTab from "components/cameratrap/analytics/OverviewTab";
import TemporalTab from "components/cameratrap/analytics/TemporalTab";
import SpeciesDetailTab from "components/cameratrap/analytics/SpeciesDetailTab";
import CoOccurrenceTab from "components/cameratrap/analytics/CoOccurrenceTab";
import LocationsTab from "components/cameratrap/analytics/LocationsTab";
import ExportTab from "components/cameratrap/analytics/ExportTab";

export default function WildlifeAnalyticsPage() {
  const [filters, setFilters] = useState({
    startDate: null,
    endDate: null,
    species: [],
    deploymentId: null,
  });

  const [activeTab, setActiveTab] = useState("overview");

  return (
    <Container size="xl" my="md">
      <Stack gap="md">
        <Group gap="sm">
          <ThemeIcon color="green" variant="light" size="xl" radius="md">
            <IconPaw size={24} />
          </ThemeIcon>
          <div>
            <Title order={3}>Wildlife Analytics</Title>
            <Text size="sm" c="dimmed">
              Analyze species observations, temporal patterns, co-occurrence,
              and biodiversity metrics
            </Text>
          </div>
        </Group>

        <WildlifeAnalyticsFilters filters={filters} onChange={setFilters} />

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab
              value="overview"
              leftSection={<IconChartBar size={16} />}
            >
              Overview
            </Tabs.Tab>
            <Tabs.Tab value="temporal" leftSection={<IconClock size={16} />}>
              Temporal Patterns
            </Tabs.Tab>
            <Tabs.Tab value="species" leftSection={<IconPaw size={16} />}>
              Species Deep Dive
            </Tabs.Tab>
            <Tabs.Tab
              value="cooccurrence"
              leftSection={<IconArrowsShuffle size={16} />}
            >
              Co-occurrence
            </Tabs.Tab>
            <Tabs.Tab
              value="locations"
              leftSection={<IconMapPin size={16} />}
            >
              Locations
            </Tabs.Tab>
            <Tabs.Tab
              value="export"
              leftSection={<IconDownload size={16} />}
            >
              Export Data
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            {activeTab === "overview" && <OverviewTab filters={filters} />}
          </Tabs.Panel>

          <Tabs.Panel value="temporal" pt="md">
            {activeTab === "temporal" && <TemporalTab filters={filters} />}
          </Tabs.Panel>

          <Tabs.Panel value="species" pt="md">
            {activeTab === "species" && (
              <SpeciesDetailTab filters={filters} />
            )}
          </Tabs.Panel>

          <Tabs.Panel value="cooccurrence" pt="md">
            {activeTab === "cooccurrence" && (
              <CoOccurrenceTab filters={filters} />
            )}
          </Tabs.Panel>

          <Tabs.Panel value="locations" pt="md">
            {activeTab === "locations" && <LocationsTab filters={filters} />}
          </Tabs.Panel>

          <Tabs.Panel value="export" pt="md">
            {activeTab === "export" && <ExportTab filters={filters} />}
          </Tabs.Panel>
        </Tabs>
      </Stack>
    </Container>
  );
}
