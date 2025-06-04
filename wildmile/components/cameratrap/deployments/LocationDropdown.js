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
        const response = await fetch("/api/cameratrap/locations", {
          next: { tags: ["locations"] },
        });
        if (!response.ok) throw new Error("Failed to fetch locations");

        const data = await response.json();

        // Filter out locations without a valid _id
        const validLocations = data.filter(
          (location) => location && location._id
        );

        let locationOptions = validLocations.map((location) => ({
          value: location._id,
          label: `${location.locationName || "Unnamed Location"}${
            location.zone ? ` - ${location.zone}` : ""
          }`,
          coordinates: location.location?.coordinates,
          projectArea: location.projectArea || "",
        }));

        // Add the initial location if it's valid and not already in the list
        if (
          initialLocation &&
          initialLocation._id &&
          !locationOptions.find((loc) => loc.value === initialLocation._id)
        ) {
          locationOptions.push({
            value: initialLocation._id,
            label: `${initialLocation.locationName || "Unnamed Location"}${
              initialLocation.zone ? ` - ${initialLocation.zone}` : ""
            }`,
            coordinates: initialLocation.location?.coordinates,
            projectArea: initialLocation.projectArea || "",
          });
        }

        locationOptions.sort((a, b) => a.label.localeCompare(b.label));

        // If no valid locations, add a placeholder option
        if (locationOptions.length === 0) {
          locationOptions = [
            { value: "no-locations", label: "No locations available" },
          ];
        }

        setLocations(locationOptions);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err.message);
        // Add a fallback option to prevent errors
        setLocations([{ value: "error", label: "Error loading locations" }]);
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
      nothingFoundMessage="No locations found"
      maxDropdownHeight={280}
    />
  );
}
