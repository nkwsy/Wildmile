"use client";
import { useState, useEffect } from "react";
import { Select, Loader } from "@mantine/core";

export function LocationDropdown({
  value,
  onChange,
  label,
  required = false,
  placeholder = "Select a location",
  initialLocation = null,
}) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const response = await fetch("/api/cameratrap/locations");
        if (!response.ok) throw new Error("Failed to fetch locations");

        const data = await response.json();
        let locationOptions = data.map((location) => ({
          value: location._id,
          label: `${location.locationName}${
            location.zone ? ` - ${location.zone}` : ""
          }`,
          coordinates: location.location?.coordinates,
          projectArea: location.projectArea,
        }));

        if (
          initialLocation &&
          !locationOptions.find((loc) => loc.value === initialLocation._id)
        ) {
          locationOptions.push({
            value: initialLocation._id,
            label: `${initialLocation.locationName}${
              initialLocation.zone ? ` - ${initialLocation.zone}` : ""
            }`,
            coordinates: initialLocation.location?.coordinates,
            projectArea: initialLocation.projectArea,
          });
        }

        locationOptions.sort((a, b) => a.label.localeCompare(b.label));

        setLocations(locationOptions);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, [initialLocation]);

  if (loading) {
    return (
      <Select
        label={label}
        placeholder="Loading locations..."
        rightSection={<Loader size="xs" />}
        disabled
      />
    );
  }

  if (error) {
    return (
      <Select
        label={label}
        placeholder="Error loading locations"
        error="Failed to load locations"
        disabled
      />
    );
  }

  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={locations}
      value={value}
      onChange={onChange}
      searchable
      required={required}
      nothingFound="No locations found"
      maxDropdownHeight={280}
    />
  );
}
