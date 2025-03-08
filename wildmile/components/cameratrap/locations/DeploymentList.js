"use client";

import { useEffect, useState } from "react";
import {
  Title,
  Card,
  Group,
  Text,
  Badge,
  Button,
  Stack,
  Box,
  Skeleton,
  Paper,
  Divider,
  Table,
  TextInput,
  Modal,
} from "@mantine/core";
import {
  IconCalendar,
  IconCamera,
  IconPlus,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react";
import Link from "next/link";
import { useDisclosure } from "@mantine/hooks";
import EditDeploymentForm from "../deployments/DeploymentForm";
import { useRouter } from "next/navigation";
import { useDeploymentContext } from "./LocationDetails";

export default function DeploymentsList({
  locationId,
  locationDeployments,
  onEditDeployment,
}) {
  const [deployments, setDeployments] = useState(locationDeployments || null);
  const [loading, setLoading] = useState(!locationDeployments);
  const [error, setError] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  useEffect(() => {
    if (locationDeployments) {
      setDeployments(locationDeployments);
      setLoading(false);
    } else if (!deployments) {
      fetchDeployments();
    }
  }, [locationId, locationDeployments]);

  async function fetchDeployments() {
    try {
      setLoading(true);
      // In a real app, fetch from your API
      const response = await fetch(`/api/cameratrap/locations/${locationId}`);

      if (!response.ok) {
        throw new Error("Failed to fetch deployments");
      }

      const data = await response.json();
      setDeployments(data.deployments);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching deployments:", err);
      setError(err.message);
      setLoading(false);
    }
  }

  const handleDeploymentSuccess = () => {
    close();
    fetchDeployments();
    router.refresh();
  };

  const DeploymentItem = ({ deployment, isActive }) => (
    <Card withBorder mb="md">
      <Group position="apart">
        <Group spacing="xs">
          <Box>
            <Group spacing="xs">
              <Text weight={500}>{deployment._id}</Text>
              <Badge color={isActive ? "green" : "gray"}>
                {isActive ? "ACTIVE" : "COMPLETE"}
              </Badge>
            </Group>
            <Text size="sm" color="dimmed">
              Model: {deployment.model}
            </Text>
          </Box>
        </Group>
        {/* <Text size="sm" align="right">
          {deployment.imagesCount.toLocaleString()} images captured
        </Text> */}
      </Group>

      <Group spacing="xs" mt="sm">
        <IconCalendar size={16} />
        <Text size="sm">
          {new Date(deployment.deploymentStart).toLocaleDateString()}
          {" - "}
          {deployment.deploymentEnd
            ? new Date(deployment.deploymentEnd).toLocaleDateString()
            : "Present"}
        </Text>
      </Group>
    </Card>
  );

  if (loading) {
    return (
      <Stack>
        <Group position="apart" mb="md">
          <Title order={4}>Deployments</Title>
          <Button leftSection={<IconPlus size={16} />}>New Deployment</Button>
        </Group>

        {[1, 2].map((i) => (
          <Card key={i} withBorder mb="md">
            <Skeleton height={30} width="40%" mb={10} />
            <Skeleton height={15} width="70%" mb={15} />
            <Skeleton height={15} width="50%" />
          </Card>
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  const noDeployments = deployments.length === 0;

  return (
    <Stack>
      <Paper shadow="xs" radius="md" withBorder>
        <Group
          position="apart"
          p="md"
          style={{ borderBottom: "1px solid #e9ecef" }}
        >
          <Title order={4}>All Deployments</Title>
          <Button leftSection={<IconPlus size={16} />} onClick={open}>
            New Deployment
          </Button>
        </Group>

        <Box p="md">
          <Group mb="md">
            <Box sx={{ position: "relative", marginRight: 8 }}>
              <TextInput
                placeholder="Search deployments..."
                icon={<IconSearch size={16} />}
                sx={{ width: 250 }}
              />
            </Box>
            <Button variant="default" leftSection={<IconFilter size={16} />}>
              Filter
            </Button>
          </Group>

          {!deployments || deployments.length === 0 ? (
            <Text color="dimmed" align="center" py="xl">
              No deployments found for this location.
            </Text>
          ) : (
            <Table striped highlightOnHover>
              <thead>
                <tr>
                  <th>Camera</th>
                  <th>Model</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Images</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((deployment) => (
                  <tr key={deployment._id}>
                    <td>
                      <Text weight={500}>{deployment.cameraId.name}</Text>
                    </td>
                    <td>
                      {deployment.model ||
                        deployment.cameraId?.model ||
                        "Unknown"}
                    </td>
                    <td>
                      {new Date(
                        deployment.deploymentStart
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      {deployment.deploymentEnd
                        ? new Date(
                            deployment.deploymentEnd
                          ).toLocaleDateString()
                        : "Present"}
                    </td>
                    <td>
                      <Badge
                        color={!deployment.deploymentEnd ? "green" : "gray"}
                        variant="light"
                      >
                        {!deployment.deploymentEnd ? "ACTIVE" : "COMPLETED"}
                      </Badge>
                    </td>
                    <td>{deployment.mediaCount?.toLocaleString() || 0}</td>
                    <td>
                      <Group spacing="xs">
                        <Button
                          component={Link}
                          href={`/cameratrap/deployments/${deployment._id}`}
                          variant="subtle"
                          color="blue"
                        >
                          View
                        </Button>

                        <Button
                          variant="subtle"
                          color="gray"
                          onClick={() => onEditDeployment(deployment._id)}
                        >
                          Edit
                        </Button>
                      </Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </Box>
      </Paper>

      {/* Modal for New Deployment */}
      <Modal opened={opened} onClose={close} title="New Deployment" size="lg">
        <EditDeploymentForm
          locationId={locationId}
          onSuccess={handleDeploymentSuccess}
        />
      </Modal>
    </Stack>
  );
}

export function DeploymentsPreview({ locationId, locationDeployments }) {
  const [deployments, setDeployments] = useState(locationDeployments || []);
  const [loading, setLoading] = useState(!locationDeployments);
  const [error, setError] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();

  useEffect(() => {
    if (locationDeployments) {
      setDeployments(locationDeployments);
      setLoading(false);
    } else {
      console.log("fetching deployments");
      // fetchDeployments();
    }
  }, [locationId, locationDeployments]);

  const handleDeploymentSuccess = () => {
    close();
    fetchDeployments();
    router.refresh();
  };

  if (loading) {
    return (
      <Box mt="xl">
        <Paper shadow="xs" radius="md" withBorder>
          <Group
            position="apart"
            p="md"
            style={{ borderBottom: "1px solid #e9ecef" }}
          >
            <Title order={5}>Deployments</Title>
            <Button variant="subtle" size="xs">
              View All
            </Button>
          </Group>
          {[1, 2].map((i) => (
            <Box key={i} p="md">
              {i > 1 && <Divider />}
              <Skeleton height={30} width="40%" mb={10} />
              <Skeleton height={15} width="70%" mb={15} />
              <Skeleton height={15} width="50%" />
            </Box>
          ))}
        </Paper>
      </Box>
    );
  }

  if (error) {
    return <Text color="red">{error}</Text>;
  }

  // Sort deployments by start date (most recent first) and take the first 2
  const recentDeployments = [...deployments]
    .sort((a, b) => new Date(b.deploymentStart) - new Date(a.deploymentStart))
    .slice(0, 2);

  return (
    <Box mt="xl">
      <Paper shadow="xs" radius="md" withBorder>
        <Group
          position="apart"
          p="md"
          style={{ borderBottom: "1px solid #e9ecef" }}
        >
          <Title order={5}>Deployments</Title>
          {/* <Button
            variant="subtle"
            size="xs"
            component={Link}
            href={`/cameratrap/locations/${locationId}/deployments`}
          >
            View All
          </Button> */}
        </Group>

        {recentDeployments.length === 0 ? (
          <Box p="md">
            <Text color="dimmed" size="sm" align="center">
              No deployments found
            </Text>
          </Box>
        ) : (
          recentDeployments.map((deployment, index) => (
            <Box key={deployment._id}>
              {index > 0 && <Divider />}
              <Box p="md">
                <Group position="apart" align="flex-start">
                  <Box>
                    <Text weight={500}>{deployment._id}</Text>
                    <Text size="sm" color="dimmed">
                      Model:{" "}
                      {deployment.model ||
                        deployment.cameraId?.model ||
                        "Unknown"}
                    </Text>
                  </Box>
                  <Badge
                    color={!deployment.deploymentEnd ? "green" : "gray"}
                    size="sm"
                  >
                    {!deployment.deploymentEnd ? "ACTIVE" : "COMPLETED"}
                  </Badge>
                </Group>
                <Group spacing="xs" mt="xs">
                  <IconCalendar size={14} color="gray" />
                  <Text size="sm" color="dimmed">
                    {new Date(deployment.deploymentStart).toLocaleDateString()}{" "}
                    -{" "}
                    {deployment.deploymentEnd
                      ? new Date(deployment.deploymentEnd).toLocaleDateString()
                      : "Present"}
                  </Text>
                </Group>
                <Text size="sm" color="dimmed" mt="xs">
                  {deployment.mediaCount?.toLocaleString() || 0} images captured
                </Text>
              </Box>
            </Box>
          ))
        )}

        <Box p="md" style={{ borderTop: "1px solid #e9ecef" }}>
          <Button
            fullWidth
            leftSection={<IconPlus size={16} />}
            color="blue"
            onClick={open}
          >
            New Deployment
          </Button>
        </Box>
      </Paper>

      {/* Modal for New Deployment */}
      <Modal opened={opened} onClose={close} title="New Deployment" size="lg">
        <EditDeploymentForm
          locationId={locationId}
          onSuccess={handleDeploymentSuccess}
        />
      </Modal>
    </Box>
  );
}
