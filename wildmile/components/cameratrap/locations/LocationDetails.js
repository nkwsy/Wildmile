"use client";

import { useState, useContext, createContext } from "react";
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
import LocationForm from "./LocationForm";
import DeploymentDash from "../deployments/DeploymentDash";

// Create a context to manage the deployment editing state
const DeploymentContext = createContext();

export default function LocationDetails({ location }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingDeploymentId, setEditingDeploymentId] = useState(null);

  // Function to handle deployment edit request
  const handleEditDeployment = (deploymentId) => {
    setEditingDeploymentId(deploymentId);
    setActiveTab("editDeployment");
  };

  // If we don't receive location data, show a message
  if (!location) {
    return (
      <Box p="xl" style={{ flex: 1 }}>
        <Text>Select a location to view details</Text>
      </Box>
    );
  }

  return (
    <DeploymentContext.Provider value={{ handleEditDeployment }}>
      <Box p="md" style={{ flex: 1, overflowY: "auto" }}>
        <Group position="apart" mb="md">
          <Box>
            <Group spacing="xs">
              <Title order={2}>{location.locationName}</Title>
              <Badge color={location.isActive ? "green" : "gray"}>
                {location.isActive ? "ACTIVE" : "INACTIVE"}
              </Badge>
            </Group>
            <Text color="dimmed">
              Project Area: {location.projectArea || "Not set"} • Zone:{" "}
              {location.zone || "Not set"}
            </Text>
          </Box>
          <Group>
            <Button variant="outline" leftSection={<IconDownload size={16} />}>
              Export
            </Button>
            <LocationForm initialData={location} />
          </Group>
        </Group>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tabs.List>
            <Tabs.Tab value="overview" icon={<IconEye size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab
              value="deployments"
              icon={<IconCalendarEvent size={16} />}
            >
              Deployments
            </Tabs.Tab>
            <Tabs.Tab value="analytics" icon={<IconChartBar size={16} />}>
              Analytics
            </Tabs.Tab>
            <Tabs.Tab value="settings" icon={<IconSettings size={16} />}>
              Team & Settings
            </Tabs.Tab>
            {editingDeploymentId && (
              <Tabs.Tab value="editDeployment" icon={<IconEdit size={16} />}>
                Edit Deployment
              </Tabs.Tab>
            )}
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

            <DeploymentsPreview
              locationId={location._id}
              locationDeployments={location.deployments}
              tab={setActiveTab}
            />
          </Tabs.Panel>

          <Tabs.Panel value="deployments" pt="md">
            <DeploymentsList
              locationId={location._id}
              locationDeployments={location.deployments}
              onEditDeployment={handleEditDeployment}
            />
          </Tabs.Panel>

          <Tabs.Panel value="analytics" pt="md">
            <SpeciesDetected locationId={location._id} />
          </Tabs.Panel>

          <Tabs.Panel value="settings" pt="md">
            <Text>Team and settings content will go here.</Text>
          </Tabs.Panel>

          {editingDeploymentId && (
            <Tabs.Panel value="editDeployment" pt="md">
              <DeploymentDash deploymentId={editingDeploymentId} />
            </Tabs.Panel>
          )}
        </Tabs>
      </Box>
    </DeploymentContext.Provider>
  );
}

// Export the context for use in other components
export const useDeploymentContext = () => useContext(DeploymentContext);
