"use client";
import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Group,
  Stack,
  Paper,
  Title,
  Text,
  Select,
  // DateInput, // Will be imported from @mantine/dates
  // TimeInput, // Will be imported from @mantine/dates
  Switch,
  NumberInput,
  LoadingOverlay,
  Alert,
  ActionIcon,
} from "@mantine/core";
import { DateInput, TimeInput } from "@mantine/dates"; // Correct import
import { IconX, IconAlertCircle, IconCheck } from "@tabler/icons-react";

const initialFormState = {
  locationId: null,
  startDate: null,
  endDate: null,
  startTime: "",
  endTime: "",
  reviewed: false,
  reviewedByUser: false,
  animalProbability: [0.75, 1.0], // Default as per ImageFilterControls
};

export function FilterDefaultsAdmin() {
  const [formState, setFormState] = useState(initialFormState);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchLocations = useCallback(async () => {
    try {
      const response = await fetch(
        "/api/cameratrap/getDeploymentLocations?onlyUsed=true"
      );
      if (response.ok) {
        const data = await response.json();
        setLocations(
          data.map((l) => ({ value: l._id, label: l.locationName }))
        );
      } else {
        console.error("Failed to fetch locations");
        setError("Failed to fetch locations for dropdown.");
      }
    } catch (err) {
      console.error("Error fetching locations:", err);
      setError("Error fetching locations: " + err.message);
    }
  }, []);

  const fetchDefaults = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/admin/filter-defaults");
      if (response.ok) {
        const data = await response.json();
        // Ensure dates are Date objects if they are string representations
        const processedData = {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
          animalProbability: Array.isArray(data.animalProbability) && data.animalProbability.length === 2
                             ? data.animalProbability
                             : initialFormState.animalProbability, // Fallback if data is malformed
        };
        setFormState(processedData);
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to fetch filter defaults.");
      }
    } catch (err) {
      console.error("Error fetching filter defaults:", err);
      setError("Error fetching filter defaults: " + err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
    fetchDefaults();
  }, [fetchLocations, fetchDefaults]);

  const handleInputChange = (key, value) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setSuccess(null);
  };

  const handleTimeChange = (key, value) => {
    // Basic HH:MM validation or allow empty string
    if (!value || /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
       handleInputChange(key, value);
    }
  };

  const handleClearInput = (key) => {
    const defaultValue = initialFormState[key]; // Or actual schema defaults if preferred for "clear"
    if (key === 'animalProbability') {
        setFormState((prev) => ({ ...prev, [key]: [0,1] })); // Resetting to full range
    } else if (typeof defaultValue === 'boolean') {
        setFormState((prev) => ({ ...prev, [key]: false }));
    } else if (key === 'startTime' || key === 'endTime') {
        setFormState((prev) => ({ ...prev, [key]: "" }));
    }
     else {
        setFormState((prev) => ({ ...prev, [key]: null }));
    }
    setError(null);
    setSuccess(null);
  };


  const handleSubmit = async () => {
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const payload = {
        ...formState,
        // Ensure dates are sent in ISO format or whatever backend expects if not already
        startDate: formState.startDate ? formState.startDate.toISOString() : null,
        endDate: formState.endDate ? formState.endDate.toISOString() : null,
      };
      const response = await fetch("/api/admin/filter-defaults", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (response.ok) {
        const data = await response.json();
        // Update form state with potentially processed data from backend (e.g. timestamps)
         const processedData = {
          ...data,
          startDate: data.startDate ? new Date(data.startDate) : null,
          endDate: data.endDate ? new Date(data.endDate) : null,
        };
        setFormState(processedData);
        setSuccess("Filter defaults saved successfully!");
      } else {
        const errData = await response.json();
        setError(errData.message || "Failed to save filter defaults.");
        if (errData.errors) {
            // Handle specific validation errors if needed
            console.error("Validation errors:", errData.errors)
        }
      }
    } catch (err) {
      console.error("Error saving filter defaults:", err);
      setError("Error saving filter defaults: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Paper shadow="sm" p="md" withBorder>
      <LoadingOverlay visible={loading && !saving} />
      <Title order={3} mb="md">
        Camera Trap Filter Defaults
      </Title>
      <Text size="sm" color="dimmed" mb="lg">
        Set the default filter values for the camera trap identify page. These
        will be applied when a user first visits the page or clears their
        filters.
      </Text>

      {error && (
        <Alert
          icon={<IconAlertCircle size="1rem" />}
          title="Error"
          color="red"
          withCloseButton
          onClose={() => setError(null)}
          mb="md"
        >
          {error}
        </Alert>
      )}
      {success && (
        <Alert
          icon={<IconCheck size="1rem" />}
          title="Success"
          color="green"
          withCloseButton
          onClose={() => setSuccess(null)}
          mb="md"
        >
          {success}
        </Alert>
      )}

      <Stack spacing="md">
        <Select
          label="Default Location"
          placeholder="Select a default location or leave empty"
          data={locations}
          value={formState.locationId}
          onChange={(value) => handleInputChange("locationId", value)}
          clearable
          rightSection={
            formState.locationId && (
              <ActionIcon onClick={() => handleClearInput("locationId")} size="sm" variant="transparent">
                <IconX size={14} />
              </ActionIcon>
            )
          }
        />
        <Group grow>
          <DateInput
            label="Default Start Date"
            placeholder="No default start date"
            value={formState.startDate}
            onChange={(value) => handleInputChange("startDate", value)}
            clearable
          />
          <DateInput
            label="Default End Date"
            placeholder="No default end date"
            value={formState.endDate}
            onChange={(value) => handleInputChange("endDate", value)}
            clearable
          />
        </Group>
        <Group grow>
          <TimeInput
            label="Default Start Time"
            placeholder="e.g., 09:00"
            value={formState.startTime}
            onChange={(value) => handleTimeChange("startTime", value)}
            onBlur={(e) => handleTimeChange("startTime", e.currentTarget.value)}
            clearable
            rightSection={
                formState.startTime && (
                  <ActionIcon onClick={() => handleClearInput("startTime")} size="sm" variant="transparent">
                    <IconX size={14} />
                  </ActionIcon>
                )
            }
          />
          <TimeInput
            label="Default End Time"
            placeholder="e.g., 17:00"
            value={formState.endTime}
            onChange={(value) => handleTimeChange("endTime", value)}
            onBlur={(e) => handleTimeChange("endTime", e.currentTarget.value)}
            clearable
            rightSection={
                formState.endTime && (
                  <ActionIcon onClick={() => handleClearInput("endTime")} size="sm" variant="transparent">
                    <IconX size={14} />
                  </ActionIcon>
                )
            }
          />
        </Group>
        <Switch
          label="Default to 'Reviewed Images Only'"
          checked={formState.reviewed}
          onChange={(event) =>
            handleInputChange("reviewed", event.currentTarget.checked)
          }
        />
        <Switch
          label="Default to 'Images Reviewed by Me Only'"
          checked={formState.reviewedByUser}
          onChange={(event) =>
            handleInputChange("reviewedByUser", event.currentTarget.checked)
          }
        />
        <Group grow align="flex-start" mt="xs">
            <NumberInput
              label="Default Min Animal %"
              placeholder="0-100"
              value={Math.round(formState.animalProbability[0] * 100)}
              onChange={(value) => {
                const newMinDecimal = Math.max(0, Math.min(100, Number(value) || 0)) / 100;
                const currentMaxDecimal = formState.animalProbability[1];
                const newProb = newMinDecimal <= currentMaxDecimal ? [newMinDecimal, currentMaxDecimal] : [currentMaxDecimal, currentMaxDecimal];
                handleInputChange("animalProbability", newProb);
              }}
              min={0}
              max={100}
              step={1}
            />
            <NumberInput
              label="Default Max Animal %"
              placeholder="0-100"
              value={Math.round(formState.animalProbability[1] * 100)}
              onChange={(value) => {
                const newMaxDecimal = Math.max(0, Math.min(100, Number(value) || 0)) / 100;
                const currentMinDecimal = formState.animalProbability[0];
                const newProb = newMaxDecimal >= currentMinDecimal ? [currentMinDecimal, newMaxDecimal] : [currentMinDecimal, currentMinDecimal];
                handleInputChange("animalProbability", newProb);
              }}
              min={0}
              max={100}
              step={1}
            />
          </Group>

        <Button onClick={handleSubmit} loading={saving} mt="md">
          Save Defaults
        </Button>
      </Stack>
    </Paper>
  );
}

export default FilterDefaultsAdmin;
