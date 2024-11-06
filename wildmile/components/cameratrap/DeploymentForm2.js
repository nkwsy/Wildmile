"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  Button,
  Group,
  Textarea,
  Paper,
  Title,
  Select,
  LoadingOverlay,
  TextInput,
  Flex,
  Modal,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import LocationMap from "../maps/LocationMap";
import { useDisclosure } from "@mantine/hooks";
import LocationForm from "./LocationForm";
import { LocationDropdown } from "components/maps/LocationSelect";

export default function DeploymentForm() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    cameraId: "",
    locationId: "",
    deploymentStart: new Date(),
    deploymentEnd: null,
    setupBy: "",
    deploymentTags: [],
    deploymentComments: "",
  });
  const [cameras, setCameras] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapOpened, { open: openMap, close: closeMap }] = useDisclosure(false);

  // Fetch cameras and locations on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const [camerasRes, locationsRes] = await Promise.all([
          fetch("/api/cameratrap/cameras", { cache: "no-store" }),
          fetch("/api/cameratrap/locations", { cache: "no-store" }),
        ]);

        const camerasData = await camerasRes.json();
        setCameras(
          camerasData.map((camera) => ({
            value: camera._id,
            label: `${camera.name} - ${camera.model} - ${camera.manufacturer}`,
          }))
        );

        const locationsData = await locationsRes.json();
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching form data:", error);
      }
    }
    fetchData();
  }, []);

  // Load existing deployment if editing
  useEffect(() => {
    if (
      params.deploymentId &&
      params.deploymentId !== "new" &&
      locations.length > 0
    ) {
      async function fetchDeployment() {
        try {
          const res = await fetch(
            `/api/cameratrap/deployments/${params.deploymentId}`
          );
          const data = await res.json();

          setFormData({
            ...data,
            deploymentStart: data.deploymentStart
              ? new Date(data.deploymentStart)
              : new Date(),
            deploymentEnd: data.deploymentEnd
              ? new Date(data.deploymentEnd)
              : null,
          });

          // Find and set the selected location
          if (data.locationId) {
            const location = locations.find(
              (loc) => loc._id === data.locationId
            );
            setSelectedLocation(location);
          }
        } catch (error) {
          console.error("Error fetching deployment:", error);
        }
      }
      fetchDeployment();
    }
  }, [params.deploymentId, locations]);

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData((prev) => ({ ...prev, locationId: location._id }));
  };

  const handlePointSelect = (coordinates) => {
    // Find the closest location to the selected point
    if (locations.length > 0) {
      const closest = locations.reduce((prev, curr) => {
        if (!curr.location?.coordinates) return prev;
        const [prevLng, prevLat] = prev.location.coordinates;
        const [currLng, currLat] = curr.location.coordinates;
        const prevDist = Math.sqrt(
          Math.pow(prevLng - coordinates[0], 2) +
            Math.pow(prevLat - coordinates[1], 2)
        );
        const currDist = Math.sqrt(
          Math.pow(currLng - coordinates[0], 2) +
            Math.pow(currLat - coordinates[1], 2)
        );
        return prevDist < currDist ? prev : curr;
      });
      handleLocationSelect(closest);
    }
    closeMap();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        locationId: selectedLocation?._id,
      };

      const res = await fetch("/api/cameratrap/deployments", {
        method: params.deploymentId === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData),
      });

      if (!res.ok) throw new Error("Failed to submit deployment");

      router.push("/cameratrap/deployment");
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshLocations = async () => {
    try {
      const res = await fetch("/api/cameratrap/locations", {
        cache: "no-store",
      });
      const data = await res.json();
      setLocations(data);
    } catch (error) {
      console.error("Error refreshing locations:", error);
    }
  };

  return (
    <Paper p="md">
      <LoadingOverlay visible={loading} />
      <form onSubmit={handleSubmit}>
        <Flex gap="xl" direction={{ base: "column", md: "row" }}>
          <Flex direction="column" style={{ flex: 1 }} gap="md">
            <Select
              label="Camera"
              data={cameras}
              value={formData.cameraId}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, cameraId: value }))
              }
              required
            />
            <Group grow>
              <DateInput
                label="Deployment Start"
                value={formData.deploymentStart}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, deploymentStart: date }))
                }
                required
              />
              <DateInput
                label="Deployment End"
                value={formData.deploymentEnd}
                onChange={(date) =>
                  setFormData((prev) => ({ ...prev, deploymentEnd: date }))
                }
              />
            </Group>
            <Textarea
              label="Notes"
              value={formData.deploymentComments}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  deploymentComments: e.target.value,
                }))
              }
            />
          </Flex>

          <Flex direction="column" style={{ flex: 1 }} gap="md">
            <Title order={3}>Location</Title>
            <Button onClick={openMap}>Select Location on Map</Button>
            <LocationForm
              refreshLocations={refreshLocations}
              setLocation={handleLocationSelect}
            />

            <LocationDropdown
              locations={locations}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
            />
            <Select
              label="Select Existing Location"
              data={locations.map((loc) => ({
                value: loc._id,
                label: loc.locationName,
              }))}
              value={selectedLocation?._id}
              onChange={(value) => {
                const location = locations.find((loc) => loc._id === value);
                handleLocationSelect(location);
              }}
            />
          </Flex>
        </Flex>

        <Group justify="flex-end" mt="xl">
          <Button type="submit" loading={loading}>
            {params.deploymentId === "new" ? "Create" : "Update"} Deployment
          </Button>
        </Group>
      </form>

      <Modal
        opened={mapOpened}
        onClose={closeMap}
        title="Select Location"
        size="xl"
      >
        <LocationMap
          onPointSelect={handlePointSelect}
          existingLocations={locations}
          selectedLocation={selectedLocation}
        />
      </Modal>
    </Paper>
  );
}

const EditDeploymentForm = ({ form, onSubmit }) => {
  if (!form || typeof form.getInputProps !== "function") {
    console.warn("Form is undefined or invalid in EditDeploymentForm");
    return null;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        Edit Deployment
      </Title>
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack spacing="md">
          <TextInput
            label="Location Name"
            placeholder="Enter location name"
            {...form.getInputProps("locationName")}
          />
          <Group grow>
            <DateInput
              label="Deployment Start"
              placeholder="Select start date"
              value={form.values.deploymentStart}
              onChange={(date) => form.setFieldValue("deploymentStart", date)}
              clearable={false}
            />
            <DateInput
              label="Deployment End"
              placeholder="Select end date"
              value={form.values.deploymentEnd}
              onChange={(date) => form.setFieldValue("deploymentEnd", date)}
              clearable={true}
              minDate={
                form.values.deploymentStart
                  ? new Date(form.values.deploymentStart)
                  : undefined
              }
            />
          </Group>
          <NumberInput
            label="Camera Height (meters)"
            placeholder="Enter camera height"
            precision={2}
            {...form.getInputProps("cameraHeight")}
          />
          <NumberInput
            label="Camera Tilt (degrees)"
            placeholder="Enter camera tilt"
            precision={1}
            max={360}
            {...form.getInputProps("cameraTilt")}
          />
          <Group position="right">
            <Button type="submit">Save Changes</Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
};
<EditDeploymentForm form={form} onSubmit={form.onSubmit(handleSubmit)} />;
