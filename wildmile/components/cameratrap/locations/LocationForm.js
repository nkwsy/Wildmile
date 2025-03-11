"use client";
import { useState, useEffect } from "react";
import {
  TextInput,
  Textarea,
  Button,
  Group,
  Stack,
  Modal,
  TagsInput,
  Switch,
  Autocomplete,
  Text,
  Loader,
  Card,
  Grid,
  SimpleGrid,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import SelectLocationMap from "./SelectLocationMap";

export default function LocationForm({
  initialData = null,
  onSuccess,
  onClose,
}) {
  const [opened, { open, close }] = useDisclosure(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState({
    zones: [],
    projectAreas: [],
    tags: [],
  });
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [nameModified, setNameModified] = useState(false);

  const form = useForm({
    initialValues: {
      locationName: initialData?.locationName || "",
      zone: initialData?.zone || "",
      projectArea: initialData?.projectArea || "",
      coordinates:
        initialData?.location?.coordinates || initialData?.coordinates || [],
      tags: initialData?.tags || [],
      mount: initialData?.mount || "",
      notes: initialData?.notes || "",
      favorite: initialData?.favorite || false,
      retired: initialData?.retired || false,
    },
    validate: {
      locationName: (value) => (!value ? "Location name is required" : null),
      coordinates: (value) =>
        !Array.isArray(value) || value.length !== 2
          ? "Please select a location on the map"
          : null,
    },
  });

  // Reset name modified state when form is opened
  useEffect(() => {
    if (opened) {
      setNameModified(false);
      form.resetTouched();
      form.resetDirty();
      fetchSuggestions();
    }
  }, [opened]);

  // Handle dynamic location name
  useEffect(() => {
    if (!nameModified && !form.isTouched("locationName")) {
      const projectArea = form.values.projectArea;
      const zone = form.values.zone;

      if (projectArea && zone) {
        const generatedName = `${projectArea}-${zone}`;
        form.setFieldValue("locationName", generatedName);
      }
    }
  }, [form.values.projectArea, form.values.zone]);

  const fetchSuggestions = async () => {
    try {
      setLoadingSuggestions(true);
      const response = await fetch("/api/cameratrap/locations/suggestions");
      if (!response.ok) throw new Error("Failed to fetch suggestions");
      const data = await response.json();
      setSuggestions(data);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const handleLocationNameChange = (event) => {
    setNameModified(true);
    form.getInputProps("locationName").onChange(event);
  };

  const handlePointSelect = (coordinates) => {
    form.setFieldValue("coordinates", coordinates);
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    setError(null);

    try {
      const url = initialData
        ? `/api/cameratrap/locations/${initialData._id}`
        : "/api/cameratrap/locations";

      const formattedValues = {
        ...values,
        location: {
          type: "Point",
          coordinates: values.coordinates,
        },
      };

      const response = await fetch(url, {
        method: initialData ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formattedValues),
      });

      if (!response.ok) throw new Error("Failed to save location");

      const data = await response.json();
      onSuccess?.(data);
      close();
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    form.reset();
    close();
  };

  const handleProjectAreaChange = (value) => {
    form.setFieldValue("projectArea", value);

    // Add to suggestions if it's a new value
    if (value && !suggestions.projectAreas.includes(value)) {
      setSuggestions((current) => ({
        ...current,
        projectAreas: [...current.projectAreas, value].sort(),
      }));
    }
  };

  const handleZoneChange = (value) => {
    form.setFieldValue("zone", value);

    // Add to suggestions if it's a new value
    if (value && !suggestions.zones.includes(value)) {
      setSuggestions((current) => ({
        ...current,
        zones: [...current.zones, value].sort(),
      }));
    }
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={handleClose}
        title={initialData ? "Edit Location" : "New Location"}
        size="xl"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Grid gutter="md">
            {/* Left side - Map */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Card withBorder>
                <Stack>
                  <Text size="sm" weight={500}>
                    Location
                  </Text>
                  <SelectLocationMap
                    initialCoordinates={form.values.coordinates}
                    onLocationSelect={handlePointSelect}
                  />
                  {Array.isArray(form.values.coordinates) &&
                    form.values.coordinates.length === 2 && (
                      <Text size="sm" c="dimmed">
                        Selected: {form.values.coordinates[0].toFixed(6)},{" "}
                        {form.values.coordinates[1].toFixed(6)}
                      </Text>
                    )}
                </Stack>
              </Card>
            </Grid.Col>

            {/* Right side - Form inputs */}
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack>
                {/* Project Area and Zone on same line */}
                <SimpleGrid cols={2}>
                  <Autocomplete
                    label="Project Area"
                    placeholder="Enter or select"
                    data={suggestions.projectAreas}
                    value={form.values.projectArea}
                    onChange={handleProjectAreaChange}
                    disabled={loadingSuggestions}
                    rightSection={
                      loadingSuggestions ? <Loader size="xs" /> : null
                    }
                  />
                  <Autocomplete
                    label="Zone"
                    placeholder="Enter or select"
                    data={suggestions.zones}
                    value={form.values.zone}
                    onChange={handleZoneChange}
                    disabled={loadingSuggestions}
                    rightSection={
                      loadingSuggestions ? <Loader size="xs" /> : null
                    }
                  />
                </SimpleGrid>

                <TextInput
                  label="Location Name"
                  description={
                    !nameModified && !form.isTouched("locationName")
                      ? "Auto-generated from Project Area and Zone"
                      : ""
                  }
                  required
                  {...form.getInputProps("locationName")}
                  onChange={handleLocationNameChange}
                />

                {/* Mount Type and Tags on same line */}
                <SimpleGrid cols={2}>
                  <TextInput
                    label="Mount Type"
                    {...form.getInputProps("mount")}
                  />
                  <TagsInput
                    label="Tags"
                    {...form.getInputProps("tags")}
                    data={suggestions.tags}
                    splitChars={[",", " "]}
                  />
                </SimpleGrid>

                <Textarea
                  label="Notes"
                  {...form.getInputProps("notes")}
                  minRows={3}
                />

                {/* Switches in a group */}
                <Group spacing="xl">
                  <Switch
                    label="Favorite"
                    {...form.getInputProps("favorite", { type: "checkbox" })}
                  />
                  <Switch
                    label="Retired"
                    {...form.getInputProps("retired", { type: "checkbox" })}
                  />
                </Group>

                {error && (
                  <Text color="red" size="sm">
                    {error}
                  </Text>
                )}

                {/* Action buttons */}
                <Group position="right" mt="md">
                  <Button variant="subtle" onClick={close}>
                    Cancel
                  </Button>
                  <Button type="submit" loading={loading}>
                    {initialData ? "Save Changes" : "Create Location"}
                  </Button>
                </Group>
              </Stack>
            </Grid.Col>
          </Grid>
        </form>
      </Modal>

      <Button onClick={open}>
        {initialData ? "Edit Location" : "New Location"}
      </Button>
    </>
  );
}
