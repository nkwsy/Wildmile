"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Title,
  Group,
  Stack,
  Card,
  Text,
  ActionIcon,
  Alert,
} from "@mantine/core";
import { IconEdit, IconTrash, IconStar } from "@tabler/icons-react";
import LocationForm from "components/cameratrap/locations/LocationForm";
import { useDeploymentMap } from "components/cameratrap/deployments/DeploymentMapContext";
import { DeploymentMapObject } from "components/cameratrap/deployments/DeploymentMap";
import classes from "./LocationsPage.module.css";

export default function LocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { selectedLocation, setSelectedLocation } = useDeploymentMap();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cameratrap/locations");
      if (!response.ok) throw new Error("Failed to fetch locations");
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleDelete = async (locationId) => {
    if (!confirm("Are you sure you want to delete this location?")) return;

    try {
      const response = await fetch(`/api/cameratrap/locations/${locationId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete location");
      fetchLocations();
      if (selectedLocation?._id === locationId) {
        setSelectedLocation(null);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container size="xl">
      <Stack spacing="md">
        <Group position="apart">
          <Title order={2}>Deployment Locations</Title>
          <LocationForm onSuccess={fetchLocations} />
        </Group>

        {error && (
          <Alert color="red" title="Error">
            {error}
          </Alert>
        )}

        <Group grow align="flex-start">
          <Card>
            <Stack>
              {locations.map((location) => (
                <Card
                  key={location._id}
                  withBorder
                  className={
                    selectedLocation?._id === location._id
                      ? classes.selected
                      : ""
                  }
                  onClick={() => setSelectedLocation(location)}
                >
                  <Group position="apart">
                    <Stack spacing="xs">
                      <Group spacing="xs">
                        <Text fw={500}>{location.locationName}</Text>
                        {location.favorite && (
                          <IconStar size={16} style={{ color: "gold" }} />
                        )}
                      </Group>
                      {location.zone && (
                        <Text size="sm" c="dimmed">
                          Zone: {location.zone}
                        </Text>
                      )}
                      <Text size="sm" c="dimmed">
                        {location.notes}
                      </Text>
                      {location.tags?.length > 0 && (
                        <Group spacing="xs">
                          {location.tags.map((tag) => (
                            <Text key={tag} size="xs">
                              #{tag}
                            </Text>
                          ))}
                        </Group>
                      )}
                    </Stack>
                    <Group>
                      <LocationForm
                        initialData={location}
                        onSuccess={fetchLocations}
                      />
                      <ActionIcon
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(location._id);
                        }}
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Card>

          <Card>
            <DeploymentMapObject />
          </Card>
        </Group>
      </Stack>
    </Container>
  );
}
