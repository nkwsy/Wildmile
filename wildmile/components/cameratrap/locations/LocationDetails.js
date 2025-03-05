"use client";

import { useState } from "react";
import { Box, Tabs, Title, Group, Text, Button, Badge } from "@mantine/core";
import {
  IconEye,
  IconCalendarEvent,
  IconSettings,
  IconChartBar,
  IconDownload,
  IconEdit,
} from "@tabler/icons-react";
import LocationMap from "./LocationMap";
import RecentCaptures from "./RecentCaptures";
import DeploymentsList, { DeploymentsPreview } from "./DeploymentList";
import SpeciesDetected from "./SpeciesDetected";

export default function LocationDetails({ location }) {
  const [activeTab, setActiveTab] = useState("overview");

  // If we don't receive location data, show a message
  if (!location) {
    return (
      <Box p="xl" style={{ flex: 1 }}>
        <Text>Select a location to view details</Text>
      </Box>
    );
  }

  return (
    <Box p="md" style={{ flex: 1, overflowY: "auto" }}>
      <Group position="apart" mb="md">
        <Box>
          <Group spacing="xs">
            <Title order={2}>{location.locationName}</Title>
            <Badge color={location.active ? "green" : "gray"}>
              {location.active ? "ACTIVE" : "INACTIVE"}
            </Badge>
          </Group>
          <Text color="dimmed">
            ID: {location._id} • Coordinates:{" "}
            {location.location?.coordinates?.join(", ") || "Not set"}
          </Text>
        </Box>
        <Group>
          <Button variant="outline" leftSection={<IconDownload size={16} />}>
            Export
          </Button>
          <Button variant="outline" leftSection={<IconEdit size={16} />}>
            Edit Location
          </Button>
        </Group>
      </Group>

      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tabs.List>
          <Tabs.Tab value="overview" icon={<IconEye size={16} />}>
            Overview
          </Tabs.Tab>
          <Tabs.Tab value="deployments" icon={<IconCalendarEvent size={16} />}>
            Deployments
          </Tabs.Tab>
          <Tabs.Tab value="analytics" icon={<IconChartBar size={16} />}>
            Analytics
          </Tabs.Tab>
          <Tabs.Tab value="settings" icon={<IconSettings size={16} />}>
            Team & Settings
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="overview" pt="md">
          <Group align="flex-start" grow>
            <Box>
              <Title order={5} mb="md">
                Location Map
              </Title>
              <LocationMap location={location} />
            </Box>
            <Box>
              <Group position="apart" mb="md">
                <Title order={5}>Recent Captures</Title>
                <Button variant="subtle" size="xs">
                  View All
                </Button>
              </Group>
              <RecentCaptures locationId={location._id} />
            </Box>
          </Group>

          <DeploymentsPreview locationId={location._id} />
        </Tabs.Panel>

        <Tabs.Panel value="deployments" pt="md">
          <DeploymentsList locationId={location._id} />
        </Tabs.Panel>

        <Tabs.Panel value="analytics" pt="md">
          <SpeciesDetected locationId={location._id} />
        </Tabs.Panel>

        <Tabs.Panel value="settings" pt="md">
          <Text>Team and settings content will go here.</Text>
        </Tabs.Panel>
      </Tabs>
    </Box>
  );
}
