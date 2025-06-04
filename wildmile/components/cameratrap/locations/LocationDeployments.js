import { useState, useEffect } from "react";
import {
  Paper,
  Stack,
  Group,
  ThemeIcon,
  Title,
  Text,
  Badge,
  Divider,
} from "@mantine/core";
import { IconCamera } from "@tabler/icons-react";
import Link from "next/link";

export function LocationDeployments({ locationId }) {
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    async function fetchDeployments() {
      const response = await fetch(
        `/api/cameratrap/deployments?locationId=${locationId}`
      );
      const data = await response.json();
      setDeployments(data);
    }
    fetchDeployments();
  }, [locationId]);

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Stack spacing="xs">
        <Group>
          <ThemeIcon size="lg" variant="light">
            <IconCamera size={20} />
          </ThemeIcon>
          <Title order={4}>Deployments</Title>
        </Group>
        <Divider />
        {deployments.map((deployment) => (
          <Paper key={deployment._id} p="xs" withBorder>
            <Group position="apart">
              <Text
                component={Link}
                href={`/cameratrap/deployment/edit/${deployment._id}`}
              >
                {deployment.cameraId?.name || "Unknown Camera"}
              </Text>
              <Badge>{deployment.deploymentEnd ? "Completed" : "Active"}</Badge>
            </Group>
            <Text size="sm" color="dimmed">
              {new Date(deployment.deploymentStart).toLocaleDateString()} -
              {deployment.deploymentEnd
                ? new Date(deployment.deploymentEnd).toLocaleDateString()
                : "Present"}
            </Text>
          </Paper>
        ))}
      </Stack>
    </Paper>
  );
}
