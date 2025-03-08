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
  Chip,
  Badge,
} from "@mantine/core";
import { IconSearch, IconPlus, IconCamera } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./LocationSidebar.module.css";
import LocationForm from "./LocationForm";
import { fetchLocations } from "/app/actions/locationActions";

export default function LocationSidebar({ activeLocationId, initialLocations = [] }) {
  // Ensure initialLocations is always an array
  const safeInitialLocations = Array.isArray(initialLocations) ? initialLocations : [];
  
  const [locations, setLocations] = useState(safeInitialLocations);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredLocations, setFilteredLocations] = useState(safeInitialLocations);
  const [loading, setLoading] = useState(safeInitialLocations.length === 0);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function loadLocations() {
      if (safeInitialLocations.length > 0) {
        setLocations(safeInitialLocations);
        setFilteredLocations(safeInitialLocations);
        return;
      }
      
      try {
        setLoading(true);
        const data = await fetchLocations();
        setLocations(Array.isArray(data) ? data : []);
        setFilteredLocations(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching locations:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadLocations();
  }, [safeInitialLocations]);

  // Client-side filtering for immediate response
  useEffect(() => {
    // Simple client-side filtering without calling the server action
    if (!searchQuery) {
      setFilteredLocations(locations);
    } else {
      const filtered = locations.filter((location) =>
        location.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      setFilteredLocations(filtered);
    }
  }, [searchQuery, locations]);

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
            {Array.isArray(filteredLocations) && filteredLocations.map((location) => (
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
                <Group>

                <Text size="xs" color="dimmed">
                  <IconCamera size={12} style={{ marginRight: 4 }} />
                  {Array.isArray(location.deployments) ? location.deployments.length : 0} deployments
                </Text>
                
                  {location.tags.map((tag) => (
                    <Badge key={tag} color="blue">
                      {tag}
                    </Badge>
                  ))}
                
                </Group>

              </Box>
            ))}
          </Stack>
        </ScrollArea>
      )}
    </Box>
  );
}
