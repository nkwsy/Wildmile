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
} from "@mantine/core";
import { IconCalendar, IconCamera, IconPlus } from "@tabler/icons-react";
import Link from "next/link";

export default function DeploymentsList({ locationId }) {
  const [deployments, setDeployments] = useState({ active: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDeployments() {
      try {
        setLoading(true);
        // In a real app, fetch from your API
        // const response = await fetch(`/api/cameratrap/locations/${locationId}/deployments`);

        // if (!response.ok) {
        //   throw new Error('Failed to fetch deployments');
        // }

        // const data = await response.json();
        // setDeployments(data);

        // Mock data for demonstration
        setTimeout(() => {
          setDeployments({
            active: [
              {
                _id: "LR011",
                model: "Reconyx",
                deploymentStart: "2024-03-14T00:00:00Z",
                deploymentEnd: null,
                imagesCount: 3719,
              },
            ],
            completed: [
              {
                _id: "LR008",
                model: "TrailCam Pro",
                deploymentStart: "2024-07/01T00:00:00Z",
                deploymentEnd: "2024-09/05T00:00:00Z",
                imagesCount: 4211,
              },
            ],
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching deployments:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchDeployments();
  }, [locationId]);

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
        <Text size="sm" align="right">
          {deployment.imagesCount.toLocaleString()} images captured
        </Text>
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
          <Button leftIcon={<IconPlus size={16} />}>New Deployment</Button>
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

  const noDeployments =
    deployments.active.length === 0 && deployments.completed.length === 0;

  return (
    <Stack>
      <Group position="apart" mb="md">
        <Title order={4}>Deployments</Title>
        <Button
          component={Link}
          href={`/cameratrap/deployment/new?locationId=${locationId}`}
          leftIcon={<IconPlus size={16} />}
        >
          New Deployment
        </Button>
      </Group>

      {noDeployments && (
        <Text color="dimmed">No deployments found for this location.</Text>
      )}

      {deployments.active.length > 0 && (
        <>
          <Title order={5}>Active Deployments</Title>
          {deployments.active.map((deployment) => (
            <DeploymentItem
              key={deployment._id}
              deployment={deployment}
              isActive={true}
            />
          ))}
        </>
      )}

      {deployments.completed.length > 0 && (
        <>
          <Title order={5}>Completed Deployments</Title>
          {deployments.completed.map((deployment) => (
            <DeploymentItem
              key={deployment._id}
              deployment={deployment}
              isActive={false}
            />
          ))}
        </>
      )}
    </Stack>
  );
}

export function DeploymentsPreview({ locationId }) {
  const [deployments, setDeployments] = useState({ active: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchDeployments() {
      try {
        setLoading(true);
        // In a real app, fetch from your API
        // const response = await fetch(`/api/cameratrap/locations/${locationId}/deployments`);

        // if (!response.ok) {
        //   throw new Error('Failed to fetch deployments');
        // }

        // const data = await response.json();
        // setDeployments(data);

        // Mock data for demonstration
        setTimeout(() => {
          setDeployments({
            active: [
              {
                _id: "DEP-2023-001",
                model: "Bushnell Core DS",
                deploymentStart: "2023-01-15T00:00:00Z",
                deploymentEnd: null,
                imagesCount: 1243,
              },
            ],
            completed: [
              {
                _id: "DEP-2022-005",
                model: "Reconyx HyperFire 2",
                deploymentStart: "2022-10-10T00:00:00Z",
                deploymentEnd: "2022-12-20T00:00:00Z",
                imagesCount: 876,
              },
            ],
          });
          setLoading(false);
        }, 1000);
      } catch (err) {
        console.error("Error fetching deployments:", err);
        setError(err.message);
        setLoading(false);
      }
    }

    fetchDeployments();
  }, [locationId]);

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

  // Combine active and completed deployments for preview
  const recentDeployments = [
    ...deployments.active,
    ...deployments.completed,
  ].slice(0, 2);

  return (
    <Box mt="xl">
      <Paper shadow="xs" radius="md" withBorder>
        <Group
          position="apart"
          p="md"
          style={{ borderBottom: "1px solid #e9ecef" }}
        >
          <Title order={5}>Deployments</Title>
          <Button
            variant="subtle"
            size="xs"
            component={Link}
            href={`/cameratrap/locations/${locationId}/deployments`}
          >
            View All
          </Button>
        </Group>

        {recentDeployments.map((deployment, index) => (
          <Box key={deployment._id}>
            {index > 0 && <Divider />}
            <Box p="md">
              <Group position="apart" align="flex-start">
                <Box>
                  <Text weight={500}>{deployment._id}</Text>
                  <Text size="sm" color="dimmed">
                    Model: {deployment.model}
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
                  {new Date(deployment.deploymentStart).toLocaleDateString()} -{" "}
                  {deployment.deploymentEnd
                    ? new Date(deployment.deploymentEnd).toLocaleDateString()
                    : "Present"}
                </Text>
              </Group>
              <Text size="sm" color="dimmed" mt="xs">
                {deployment.imagesCount.toLocaleString()} images captured
              </Text>
            </Box>
          </Box>
        ))}

        <Box p="md" style={{ borderTop: "1px solid #e9ecef" }}>
          <Button
            fullWidth
            leftSection={<IconPlus size={16} />}
            color="blue"
            component={Link}
            href={`/cameratrap/deployment/new?locationId=${locationId}`}
          >
            New Deployment
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
