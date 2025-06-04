// app/cameratrap/locations/LocationsNavbar.js
"use client";

import { useState } from "react";
import {
  TextInput,
  Button,
  Badge,
  Text,
  Group,
  ScrollArea,
} from "@mantine/core";
import { IconSearch, IconMapPin, IconPlus } from "@tabler/icons-react";
import LocationForm from "components/cameratrap/locations/LocationForm";

export default function LocationsNavbar() {
  const [selectedLocation, setSelectedLocation] = useState("SB_SLIP_DOCK");

  const locations = [
    {
      id: "SB_SLIP_DOCK",
      name: "Sunken Dock",
      coords: [-87.6626, 41.848],
      deployments: 3,
      active: true,
    },
    {
      id: "NB_RIVER_EDGE",
      name: "North Branch Edge",
      coords: [-87.6589, 41.8912],
      deployments: 2,
      active: true,
    },
    {
      id: "LP_POND_NORTH",
      name: "Lincoln Park Pond",
      coords: [-87.6351, 41.9256],
      deployments: 1,
      active: false,
    },
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-full overflow-y-auto">
      {/* Header section */}
      <div className="p-4">
        <Group mb="md">
          <IconMapPin size={20} />
          <Text fw={500} size="lg">
            Locations
          </Text>
        </Group>
        <TextInput
          placeholder="Search locations..."
          leftSection={<IconSearch size={16} />}
          mb="md"
        />
      </div>

      {/* Scrollable content section */}
      <ScrollArea className="flex-grow">
        <div className="p-4">
          {locations.map((location) => (
            <Button
              key={location.id}
              variant={selectedLocation === location.id ? "light" : "subtle"}
              color={selectedLocation === location.id ? "blue" : "gray"}
              fullWidth
              styles={{
                root: {
                  justifyContent: "flex-start",
                  height: "auto",
                  padding: "12px",
                  marginBottom: "4px",
                  borderRadius: "4px",
                },
                inner: {
                  justifyContent: "space-between",
                  width: "100%",
                },
              }}
              onClick={() => setSelectedLocation(location.id)}
            >
              <div>
                <Text fw={500}>{location.name}</Text>
                <Text size="xs" c="dimmed">
                  {location.deployments} deployment
                  {location.deployments !== 1 ? "s" : ""}
                </Text>
              </div>
              <Badge
                variant="dot"
                color={location.active ? "green" : "gray"}
                size="sm"
              />
            </Button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer section */}
      <div className="p-4 border-t border-gray-200">
        <LocationForm />
      </div>
    </div>
  );
}
