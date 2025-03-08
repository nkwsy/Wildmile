"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Box,
  Text,
  Title,
  Card,
  Stack,
  Button,
  TextInput,
  ScrollArea,
  Loader,
  Group,
  ActionIcon,
} from "@mantine/core";
import { IconSearch, IconPlus, IconCamera } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./LocationSidebar.module.css";
import LocationForm from "./LocationForm";
export default function LocationSidebar({ activeLocationId }) {
  const [locations, setLocations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function fetchLocations() {
      try {
        setLoading(true);
        // In a real app, this would be your API endpoint
        const response = await fetch("/api/cameratrap/locations");

        if (!response.ok) {
          throw new Error("Failed to fetch locations");
        }

        const data = await response.json();
        setLocations(data);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err.message);

        // Fallback to mock data for demonstration
        setLocations([
          {
            _id: "SB_SLIP_DOCK",
            locationName: "Sunken Dock",
            active: true,
            deployments: 3,
          },
          {
            _id: "NORTH_BRANCH_EDGE",
            locationName: "North Branch Edge",
            active: true,
            deployments: 2,
          },
          {
            _id: "LINCOLN_PARK_POND",
            locationName: "Lincoln Park Pond",
            active: false,
            deployments: 1,
          },
        ]);
      } finally {
        setLoading(false);
      }
    }

    fetchLocations();
  }, []);

  const filteredLocations = locations.filter((location) =>
    location.locationName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLocationClick = (locationId) => {
    router.push(`/cameratrap/locations/${locationId}`);
  };

  return (
    <Box className={classes.sidebar}>
      <Title order={5} px="md" py="sm">
        Locations
      </Title>

      <Box px="md" pb="md">
        <TextInput
          placeholder="Search locations..."
          icon={<IconSearch size={16} />}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          mb="sm"
        />

        <LocationForm />
      </Box>

      {loading ? (
        <Box p="md" style={{ display: "flex", justifyContent: "center" }}>
          <Loader size="sm" />
        </Box>
      ) : error ? (
        <Text color="red" size="sm" p="md">
          {error}
        </Text>
      ) : (
        <ScrollArea className={classes.locationList}>
          <Stack spacing={0}>
            {filteredLocations.map((location) => (
              <Box
                key={location._id}
                onClick={() => handleLocationClick(location._id)}
                className={`${classes.locationCard} ${
                  activeLocationId === location._id ? classes.selected : ""
                }`}
              >
                <Group position="apart" mb={4}>
                  <Text fw={500}>{location.locationName}</Text>
                  <Box
                    className={
                      location.isActive
                        ? classes.activeIndicator
                        : classes.inactiveIndicator
                    }
                    title={location.isActive ? "Active" : "Inactive"}
                  />
                </Group>
                <Text size="xs" color="dimmed">
                  <IconCamera size={12} style={{ marginRight: 4 }} />
                  {location.deployments} deployments
                </Text>
              </Box>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Box>
  );
}
