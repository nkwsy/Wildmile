"use client";
import { useState, useEffect } from "react";
import {
  TextInput,
  NumberInput,
  Button,
  Group,
  Stack,
  Card,
  Title,
  Alert,
  Loader,
  Select,
  Text,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { getAllCameras } from "app/actions/CameratrapActions";
import { LocationDropdown } from "./LocationDropdown";
import { useDeploymentMap } from "./DeploymentMapContext";

const EditDeploymentForm = ({ deploymentId, onSuccess, locationId }) => {
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [cameraOptions, setCameraOptions] = useState([]);
  const router = useRouter();
  const [initialLocation, setInitialLocation] = useState(locationId || null);
  const { selectedLocation, setSelectedLocation } = useDeploymentMap();

  const form = useForm({
    initialValues: {
      locationName: "",
      locationId: locationId || "",
      cameraHeight: 0,
      cameraTilt: 0,
      deploymentStart: new Date(),
      deploymentEnd: null,
      cameraId: "",
    },
    validate: {
      deploymentStart: (value) => (!value ? "Start date is required" : null),
      cameraHeight: (value) => (value < 0 ? "Height must be positive" : null),
      cameraTilt: (value) =>
        value < -90 || value > 360 ? "Invalid tilt angle" : null,
      cameraId: (value) => (!value ? "Camera selection is required" : null),
      locationId: (value) => (!value ? "Location selection is required" : null),
    },
  });

  // Fetch cameras for dropdown
  useEffect(() => {
    async function fetchCameras() {
      try {
        const camerasJson = await getAllCameras();
        if (!camerasJson) {
          throw new Error("No camera data received");
        }

        const cameras = JSON.parse(camerasJson);
        if (!Array.isArray(cameras)) {
          console.error("Cameras data is not an array:", cameras);
          setCameraOptions([{ value: "dummy", label: "No cameras available" }]);
          return;
        }

        // Ensure each camera has an _id
        const validOptions = cameras
          .filter((camera) => camera && camera._id) // Filter out any null/undefined cameras or those without _id
          .map((camera) => ({
            value: camera._id,
            label: camera.name
              ? `${camera.name} - ${camera.model || ""} - ${
                  camera.manufacturer || ""
                }`
              : `${camera._id} - ${camera.model || ""} - ${
                  camera.manufacturer || ""
                }`,
          }));

        if (validOptions.length === 0) {
          // Provide a fallback option if no valid cameras
          setCameraOptions([{ value: "dummy", label: "No cameras available" }]);
        } else {
          setCameraOptions(validOptions);
        }
      } catch (err) {
        console.error("Error fetching cameras:", err);
        setError("Failed to load cameras");
        // Set a dummy option to prevent the error
        setCameraOptions([{ value: "dummy", label: "Error loading cameras" }]);
      } finally {
        setFetchLoading(false);
      }
    }
    fetchCameras();
  }, []);

  // Fetch initial deployment data
  useEffect(() => {
    async function fetchDeployment() {
      try {
        const response = await fetch(
          `/api/cameratrap/deployments/${deploymentId}`,
          { next: { tags: ["deployments"] } }
        );
        if (!response.ok) throw new Error("Failed to fetch deployment");
        const data = await response.json();

        // Store the full location object if it exists
        if (data.locationId && typeof data.locationId === "object") {
          setInitialLocation(data.locationId);
        }

        const initialValues = {
          locationName: data.locationName || "",
          locationId: data.locationId?._id || data.locationId || "",
          cameraHeight: data.cameraHeight || 0,
          cameraTilt: data.cameraTilt || 0,
          deploymentStart: data.deploymentStart
            ? new Date(data.deploymentStart)
            : new Date(),
          deploymentEnd: data.deploymentEnd
            ? new Date(data.deploymentEnd)
            : null,
          cameraId: data.cameraId?._id || data.cameraId || "",
        };

        form.setValues(initialValues);
        form.resetDirty(initialValues);
      } catch (err) {
        setError(err.message);
      } finally {
        setFetchLoading(false);
      }
    }

    if (deploymentId) {
      fetchDeployment();
    } else {
      setFetchLoading(false);
    }
  }, [deploymentId]);

  useEffect(() => {
    if (selectedLocation) {
      form.setFieldValue("locationId", selectedLocation._id);
    }
  }, [selectedLocation]);

  const handleSubmit = async (values) => {
    // Check if any fields are dirty (changed)
    const changedValues = Object.keys(values).reduce((acc, key) => {
      if (form.isDirty(key)) {
        // Special handling for dates
        if (key === "deploymentStart" || key === "deploymentEnd") {
          // Ensure we have a valid date before including it
          const dateValue = values[key] ? new Date(values[key]) : null;
          if (dateValue && !isNaN(dateValue.getTime())) {
            acc[key] = dateValue.toISOString(); // Convert to ISO string for consistency
          }
        } else {
          acc[key] = values[key];
        }
      }
      return acc;
    }, {});

    // Validate dates before submitting
    if (
      changedValues.deploymentStart &&
      isNaN(new Date(changedValues.deploymentStart).getTime())
    ) {
      setError("Invalid start date");
      return;
    }
    if (!deploymentId && locationId) {
      changedValues.locationId = locationId;
    }

    if (!deploymentId) {
      if (!changedValues.locationId) {
        setError("Location is required");
        return;
      }
    }

    if (
      changedValues.deploymentEnd &&
      isNaN(new Date(changedValues.deploymentEnd).getTime())
    ) {
      setError("Invalid end date");
      return;
    }

    // If no values have changed, return early
    if (Object.keys(changedValues).length === 0) {
      onSuccess?.();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = deploymentId
        ? `/api/cameratrap/deployments/${deploymentId}`
        : "/api/cameratrap/deployments/new";

      const method = deploymentId ? "PUT" : "POST";
      const response = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changedValues),
        next: { tags: ["deployments"] },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update deployment");
      }

      const updatedDeployment = await response.json();
      onSuccess?.(updatedDeployment);

      // Get the ID from either the existing deploymentId or the new deployment's _id
      const redirectId = deploymentId || updatedDeployment._id;
      if (!onSuccess) {
        // router.push(`/cameratrap/deployment/edit/${redirectId}`);
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Stack align="center" spacing="md">
          <Loader />
          <Text size="sm" color="dimmed">
            Loading deployment data...
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Title order={3} mb="md">
        {deploymentId ? "Edit Deployment" : "New Deployment"}
      </Title>
      {error && (
        <Alert color="red" mb="md">
          {error}
        </Alert>
      )}
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack spacing="md">
          <Select
            label="Camera"
            placeholder="Select a camera"
            data={cameraOptions}
            {...form.getInputProps("cameraId")}
            required
            searchable
            nothingFoundMessage="No cameras found"
          />
          <LocationDropdown
            label="Location"
            placeholder="Select a location"
            value={form.values.locationId}
            onChange={(value) => {
              form.setFieldValue("locationId", value);
              form.setFieldValue("locationName", "");
            }}
            required
            initialLocation={initialLocation}
          />
          {!form.values.locationId && (
            <TextInput
              label="Custom Location Name"
              placeholder="Enter location name"
              {...form.getInputProps("locationName")}
            />
          )}
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
            <Button type="submit" loading={loading} disabled={!form.isDirty()}>
              {form.isDirty() ? "Save Changes" : "No Changes"}
            </Button>
          </Group>
        </Stack>
      </form>
    </Card>
  );
};

export default EditDeploymentForm;
