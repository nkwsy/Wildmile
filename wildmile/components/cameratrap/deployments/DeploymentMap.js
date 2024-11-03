"use client";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Card, Text, Group, Badge } from "@mantine/core";
import classes from "./DeploymentMap.module.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export default function DeploymentMap({ locations = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);

  const [lng] = useState(-87.65);
  const [lat] = useState(41.9);
  const [zoom] = useState(9);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    initializeMap.on("load", () => {
      map.current = initializeMap;
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      setMapReady(true);
    });

    return () => {
      initializeMap.remove();
    };
  }, []);

  // Handle markers
  useEffect(() => {
    if (!mapReady || !map.current || !locations.length) return;

    // Clear existing markers
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    locations.forEach((location) => {
      if (!location.location?.coordinates) return;

      const coordinates = location.location.coordinates;
      const activeDeployments = location.deployments?.active || [];
      const inactiveDeployments = location.deployments?.inactive || [];

      try {
        const el = document.createElement("div");
        el.className = `${classes.marker} ${
          activeDeployments.length > 0 ? classes.active : classes.inactive
        }`;

        // Create popup content
        const popupContent = `
          <div class="${classes.popup}">
            <h3>${location.locationName}</h3>
            ${
              activeDeployments.length > 0
                ? `<div class="${classes.deploymentInfo}">
                    <strong>Active Cameras (${
                      activeDeployments.length
                    }):</strong>
                    <ul>
                      ${activeDeployments
                        .map(
                          (dep) => `
                        <li>
                          ${dep.cameraId} - Since ${new Date(
                            dep.deploymentStart
                          ).toLocaleDateString()}
                        </li>`
                        )
                        .join("")}
                    </ul>
                  </div>`
                : ""
            }
            ${
              inactiveDeployments.length > 0
                ? `<div class="${classes.deploymentInfo}">
                    <p>Previous deployments: ${inactiveDeployments.length}</p>
                  </div>`
                : ""
            }
          </div>
        `;

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupContent))
          .addTo(map.current);

        markersRef.current[location._id] = marker;
      } catch (error) {
        console.error("Error adding marker:", error, location);
      }
    });
  }, [locations, mapReady]);

  return (
    <Card withBorder>
      <div className={classes.mapContainer}>
        <div ref={mapContainer} className={classes.map} />
        <div className={classes.legend}>
          <Text size="sm" weight={500} mb={5}>
            Legend
          </Text>
          <Group spacing="xs">
            <div className={`${classes.legendMarker} ${classes.active}`} />
            <Text size="sm">Active Cameras</Text>
          </Group>
          <Group spacing="xs">
            <div className={`${classes.legendMarker} ${classes.inactive}`} />
            <Text size="sm">Inactive Locations</Text>
          </Group>
        </div>
      </div>
    </Card>
  );
}
