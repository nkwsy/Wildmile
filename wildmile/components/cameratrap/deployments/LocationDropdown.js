"use client";
import { useState, useEffect } from "react";
import { Select, Loader } from "@mantine/core";
import { getAllLocations } from "app/actions/CameratrapActions";

export function LocationDropdown({
  label,
  placeholder,
  value,
  onChange,
  required,
  initialLocation,
}) {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLocations() {
      try {
        const locationsJson = await getAllLocations();
        if (!locationsJson) {
          throw new Error("No location data received");
        }

        const locationsData = JSON.parse(locationsJson);
        if (!Array.isArray(locationsData)) {
          console.error("Locations data is not an array:", locationsData);
          setLocations([{ value: "dummy", label: "No locations available" }]);
          return;
        }

        // Ensure each location has an _id
        const validOptions = locationsData
          .filter((location) => location && location._id) // Filter out any null/undefined locations or those without _id
          .map((location) => ({
            value: location._id,
            label: location.locationName || location._id,
          }));

        if (validOptions.length === 0) {
          // Provide a fallback option if no valid locations
          setLocations([{ value: "dummy", label: "No locations available" }]);
        } else {
          setLocations(validOptions);
        }
      } catch (err) {
        console.error("Error fetching locations:", err);
        // Set a dummy option to prevent the error
        setLocations([{ value: "dummy", label: "Error loading locations" }]);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  // If we have an initialLocation object, find it in the locations array
  useEffect(() => {
    if (initialLocation && initialLocation._id && !value) {
      onChange(initialLocation._id);
    }
  }, [initialLocation, locations, value, onChange]);

  return (
    <Select
      label={label}
      placeholder={placeholder}
      data={locations}
      value={value}
      onChange={onChange}
      searchable
      required={required}
      rightSection={loading ? <Loader size="xs" /> : null}
      disabled={loading}
      nothingFound="No locations found"
    />
  );
}
