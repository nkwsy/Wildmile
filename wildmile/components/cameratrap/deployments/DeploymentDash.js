"use client";
import { useState, useEffect } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Loader,
  Alert,
  Card,
  Title,
  Text,
  Divider,
  Grid,
  Box,
  Paper,
  Stack,
  Badge,
  ThemeIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import DeploymentLocationMap from "components/maps/DeploymentLocationMap";
import {
  IconCamera,
  IconCalendar,
  IconMapPin,
  IconRuler,
} from "@tabler/icons-react";
import EditDeploymentForm from "./EditDeploymentForm";

// Separate component for camera details
const CameraDetails = ({ camera }) => (
  <Paper shadow="xs" p="md" radius="md">
    <Stack spacing="xs">
      <Group position="apart">
        <Group>
          <ThemeIcon size="lg" variant="light">
            <IconCamera size={20} />
          </ThemeIcon>
          <Title order={4}>Camera Information</Title>
        </Group>
        <Badge variant="outline">{camera?.status || "Active"}</Badge>
      </Group>
      <Divider />
      <Text>
        <strong>Model:</strong> {camera?.model || "N/A"}
      </Text>
      <Text>
        <strong>Manufacturer:</strong> {camera?.manufacturer || "N/A"}
      </Text>
      <Text>
        <strong>Serial Number:</strong> {camera?.serialNumber || "N/A"}
      </Text>
    </Stack>
  </Paper>
);

// Separate component for deployment details
const DeploymentDetails = ({ deployment }) => (
  <Paper shadow="xs" p="md" radius="md">
    <Stack spacing="xs">
      <Group>
        <ThemeIcon size="lg" variant="light">
          <IconMapPin size={20} />
        </ThemeIcon>
        <Title order={4}>Deployment Details</Title>
      </Group>
      <Divider />
      <Grid>
        <Grid.Col span={6}>
          <Group spacing="xs">
            <IconRuler size={16} />
            <Text>
              <strong>Height:</strong> {deployment.cameraHeight}m
            </Text>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          <Text>
            <strong>Tilt:</strong> {deployment.cameraTilt}°
          </Text>
        </Grid.Col>
      </Grid>
      <Group spacing="xs">
        <IconCalendar size={16} />
        <Text>
          <strong>Duration:</strong>{" "}
          {new Date(deployment.deploymentStart).toLocaleDateString()} -{" "}
          {deployment.deploymentEnd
            ? new Date(deployment.deploymentEnd).toLocaleDateString()
            : "Ongoing"}
        </Text>
      </Group>
    </Stack>
  </Paper>
);

export default function DeploymentDash({ deploymentId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deployment, setDeployment] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchDeployment() {
      try {
        const response = await fetch(
          `/api/cameratrap/deployments/${deploymentId}`
        );
        if (!response.ok) throw new Error("Failed to fetch deployment");
        const data = await response.json();
        setDeployment(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    if (deploymentId) fetchDeployment();
    else setLoading(false);
  }, [deploymentId]);

  if (loading) return <Loader />;
  if (error) return <Alert color="red">{error}</Alert>;

  return (
    <Box p="md">
      <Grid gutter="md">
        <Grid.Col span={12}>
          <Title order={2} align="center" mb="xl">
            Deployment Dashboard
          </Title>
        </Grid.Col>

        {/* Left column - Details */}
        <Grid.Col sm={12} md={4} lg={3}>
          <Stack spacing="md">
            <CameraDetails camera={deployment.cameraId} />
            <DeploymentDetails deployment={deployment} />
          </Stack>
        </Grid.Col>

        {/* Right column - Map */}
        <Grid.Col sm={12} md={4} lg={3}>
          <Paper shadow="xs" p="md" radius="md">
            <Stack spacing="xs">
              <Group position="apart">
                <Group>
                  <ThemeIcon size="lg" variant="light">
                    <IconMapPin size={20} />
                  </ThemeIcon>
                  <Title order={4}>Location</Title>
                </Group>
                <Badge variant="light">
                  {deployment.locationId?.locationName || "No Location Set"}
                </Badge>
              </Group>
              <Text size="sm" color="dimmed">
                {deployment.locationId?.zone || "No Zone Set"}
              </Text>
              <Divider />
              <Box>
                <DeploymentLocationMap
                  location={deployment.locationId?.location}
                />
              </Box>
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Edit Form - Full width */}
        <Grid.Col span={12}>
          <EditDeploymentForm
            deploymentId={deploymentId}
            onSuccess={() =>
              router.push(`/cameratrap/deployment/edit/${deploymentId}`)
            }
          />
        </Grid.Col>
      </Grid>
    </Box>
  );
}
