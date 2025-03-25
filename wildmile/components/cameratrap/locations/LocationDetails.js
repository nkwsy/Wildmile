"use client";

import { useState, useEffect, useContext, createContext } from "react";
import {
  Box,
  Tabs,
  Title,
  Group,
  Text,
  Button,
  Badge,
  Paper,
  Stack,
  Divider,
  ThemeIcon,
} from "@mantine/core";
import {
  IconEye,
  IconCalendarEvent,
  IconSettings,
  IconChartBar,
  IconDownload,
  IconEdit,
  IconMapPin,
  IconPhoto,
} from "@tabler/icons-react";
import LocationMap from "./LocationMap";
import RecentCaptures from "./RecentCaptures";
import DeploymentsList, { DeploymentsPreview } from "./DeploymentList";
import SpeciesDetected from "./SpeciesDetected";
import LocationForm from "./LocationForm";
import DeploymentDash from "../deployments/DeploymentDash";
import DeploymentLocationMap from "components/maps/DeploymentLocationMap";
import { LocationImages } from "./LocationImages";
import { useSearchParams, usePathname } from "next/navigation";

// Create a context to manage the deployment editing state
const DeploymentContext = createContext();

export function LocationMapObject({ location }) {
  return (
    <Paper shadow="xs" p="md" radius="md" h="100%">
      <Stack spacing="xs" h="100%">
        <Box sx={{ flex: 1 }}>
          <DeploymentLocationMap
            location={location?.location}
            style={{ height: "100%", minHeight: "300px" }}
          />
        </Box>
      </Stack>
    </Paper>
  );
}

export default function LocationDetails({ location }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [editingDeploymentId, setEditingDeploymentId] = useState(null);
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Parse URL to set active tab and deployment ID
  useEffect(() => {
    // Check for tab in search params
    const tabParam = searchParams.get("tab");
    if (
      tabParam &&
      ["overview", "deployments", "analytics", "settings", "images"].includes(
        tabParam
      )
    ) {
      setActiveTab(tabParam);
    }

    // Check for deployment ID in URL path or search params
    const deploymentParam = searchParams.get("deploymentId");
    const pathParts = pathname.split("/");
    const deploymentIdFromPath =
      pathParts.length >= 5 && pathParts[3] === "deployments"
        ? pathParts[4]
        : null;

    if (deploymentParam || deploymentIdFromPath) {
      const deploymentId = deploymentParam || deploymentIdFromPath;
      setEditingDeploymentId(deploymentId);
      setActiveTab("editDeployment");
    }
  }, [searchParams, pathname]);

  // Function to handle deployment edit request
  const handleEditDeployment = (deploymentId) => {
    setEditingDeploymentId(deploymentId);
    setActiveTab("editDeployment");

    // Optional: Update URL when editing a deployment
    // This requires a router import and is commented out as it depends on your routing setup
    // router.push(`/locations/${location._id}/deployments/${deploymentId}`);
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
            <Tabs.Tab value="overview" leftSection={<IconEye size={16} />}>
              Overview
            </Tabs.Tab>
            <Tabs.Tab
              value="deployments"
              leftSection={<IconCalendarEvent size={16} />}
            >
              Deployments
            </Tabs.Tab>
            <Tabs.Tab
              value="analytics"
              leftSection={<IconChartBar size={16} />}
            >
              Analytics
            </Tabs.Tab>
            <Tabs.Tab value="settings" leftSection={<IconSettings size={16} />}>
              Team & Settings
            </Tabs.Tab>
            <Tabs.Tab value="images" leftSection={<IconPhoto size={16} />}>
              Images
            </Tabs.Tab>
            {editingDeploymentId && (
              <Tabs.Tab
                value="editDeployment"
                leftSection={<IconEdit size={16} />}
              >
                Edit Deployment
              </Tabs.Tab>
            )}
          </Tabs.List>

          <Tabs.Panel value="overview" pt="md">
            <Group align="flex-start" grow>
              <Box>
                <LocationMapObject location={location} />
              </Box>
              <Box>
                <Group position="apart" mb="md">
                  <Title order={5}>Recent Captures</Title>

                  <Button variant="subtle" size="xs">
                    View All
                  </Button>
                </Group>
                <LocationImages
                  locationId={location._id}
                  imagesPerPage={4}
                  homepage={true}
                />
                {/* <RecentCaptures locationId={location._id} />  */}
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

          <Tabs.Panel value="images" pt="md">
            <LocationImages locationId={location._id} />
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
