"use client";

import { useRef, useEffect, useState } from "react";
import { Card, SegmentedControl, Text, Group, Box } from "@mantine/core";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Mapbox token would typically come from environment variables
const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_KEY || "your-mapbox-token";
mapboxgl.accessToken = MAPBOX_TOKEN;

export default function LocationMap({ location }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapStyle, setMapStyle] = useState("outdoors-v12");

  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
      center: location?.location?.coordinates || [-87.65, 41.9],
      zoom: 14,
    });

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add marker if coordinates exist
    if (location?.location?.coordinates) {
      marker.current = new mapboxgl.Marker({
        color: location.active ? "#4CAF50" : "#757575",
      })
        .setLngLat(location.location.coordinates)
        .addTo(map.current);
    }

    return () => {
      if (map.current) map.current.remove();
    };
  }, []);

  // Update marker position when location changes
  useEffect(() => {
    if (!map.current || !location?.location?.coordinates) return;

    // Remove existing marker
    if (marker.current) {
      marker.current.remove();
    }

    // Add new marker
    marker.current = new mapboxgl.Marker({
      color: location.active ? "#4CAF50" : "#757575",
    })
      .setLngLat(location.location.coordinates)
      .addTo(map.current);

    // Center map on marker
    map.current.flyTo({
      center: location.location.coordinates,
      zoom: 14,
      essential: true,
    });
  }, [location]);

  // Handle map style changes
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
  }, [mapStyle]);

  return (
    <Card withBorder p={0} style={{ position: "relative", height: 400 }}>
      <SegmentedControl
        value={mapStyle}
        onChange={setMapStyle}
        data={[
          { label: "Outdoors", value: "outdoors-v12" },
          { label: "Standard", value: "standard" },
          { label: "Satellite", value: "satellite-streets-v12" },
        ]}
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1,
          backgroundColor: "white",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      />

      <div ref={mapContainer} style={{ height: "100%", width: "100%" }} />

      <div
        style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          backgroundColor: "white",
          padding: "5px 10px",
          borderRadius: "4px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          zIndex: 1,
        }}
      >
        <Text size="sm" weight={500} mb={5}>
          Legend
        </Text>
        <Group spacing="xs">
          <Box
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#4CAF50",
              borderRadius: "50%",
            }}
          />
          <Text size="xs">Active Cameras</Text>
        </Group>
        <Group spacing="xs">
          <Box
            style={{
              width: "12px",
              height: "12px",
              backgroundColor: "#757575",
              borderRadius: "50%",
            }}
          />
          <Text size="xs">Inactive Locations</Text>
        </Group>
      </div>
    </Card>
  );
}
