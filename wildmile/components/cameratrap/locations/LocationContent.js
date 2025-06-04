"use client";

import { useState, useEffect } from "react";
import { Box, Text, Center, Paper, Button } from "@mantine/core";
import { IconMapPin } from "@tabler/icons-react";
import { useRouter, useSearchParams } from "next/navigation";
import LocationDetails from "./LocationDetails";
import { DeploymentMapObject } from "../deployments/DeploymentMap";
import AllDeployments from "app/cameratrap/deployment/AllDeployments";
export default function LocationsContent() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const locationId = searchParams.get("id");

  useEffect(() => {
    if (locationId) {
      fetchLocationById(locationId);
    }
  }, [locationId]);

  const fetchLocationById = async (id) => {
    setLoading(true);
    try {
      // In a real app, this would fetch from your API
      // const response = await fetch(`/api/cameratrap/locations/${id}`);
      // if (!response.ok) throw new Error('Failed to fetch location');
      // const data = await response.json();

      // Mock data for demonstration
      setTimeout(() => {
        setSelectedLocation({
          _id: id || "SB_SLIP_DOCK",
          locationName:
            id === "NORTH_BRANCH_EDGE" ? "North Branch Edge" : "Sunken Dock",
          active: true,
          location: {
            coordinates: [-87.6626, 41.848],
          },
          zone: "River Edge",
          projectArea: "Chicago River",
          notes: "Located near the bend in the river",
        });
        setLoading(false);
      }, 500);
    } catch (error) {
      console.error("Error fetching location:", error);
      setLoading(false);
    }
  };

  if (!selectedLocation && !loading) {
    return (
      <>
        <AllDeployments />
      </>
    );
  }

  return (
    <Box style={{ flex: 1 }}>
      {loading ? (
        <Center style={{ height: "100%" }}>
          <Text>Loading location data...</Text>
        </Center>
      ) : (
        <LocationDetails location={selectedLocation} />
      )}
    </Box>
  );
}
