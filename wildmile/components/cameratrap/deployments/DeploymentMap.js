"use client";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  Card,
  Text,
  Group,
  Badge,
  SegmentedControl,
  Drawer,
  Stack,
  Title,
  Divider,
  ActionIcon,
  Tooltip,
  LoadingOverlay,
} from "@mantine/core";
import { IconX, IconCalendar, IconCamera, IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./DeploymentMap.module.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export function DeploymentMapObject() {
  const [locations, setLocations] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deploymentsRes, locationsRes] = await Promise.all([
          fetch("/api/cameratrap/deployments"),
          fetch("/api/cameratrap/deploymentLocations"),
        ]);

        const [deploymentsData, locationsData] = await Promise.all([
          deploymentsRes.json(),
          locationsRes.json(),
        ]);

        setDeployments(deploymentsData);
        setLocations(locationsData);
        // const locationsRes = await Promise.all([
        //   // fetch("/api/cameratrap/deployments"),
        //   fetch("/api/cameratrap/deploymentLocations"),
        // ]);

        // // const [deploymentsData, locationsData] = await Promise.all([
        // //   deploymentsRes.json(),
        // //   locationsRes.json(),
        // // ]);

        // // setDeployments(deploymentsData);
        // const locationsData = await Promise.all(locationsRes.json());
        // setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <>
      <LoadingOverlay visible={loading} />
      <DeploymentMap locations={locations} />
    </>
  );
}

export default function DeploymentMap({ locations = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState("outdoors-v12");
  const [selectedLocation, setSelectedLocation] = useState(null);

  const [lng] = useState(-87.65);
  const [lat] = useState(41.9);
  const [zoom] = useState(9);

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/${mapStyle}`,
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

  // Handle style changes
  useEffect(() => {
    if (!map.current) return;
    map.current.setStyle(`mapbox://styles/mapbox/${mapStyle}`);
  }, [mapStyle]);

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

        // Add title attribute for hover effect
        el.title = location.locationName;

        // Add click handler
        el.addEventListener("click", () => {
          setSelectedLocation(location);
        });

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current);

        markersRef.current[location._id] = marker;
      } catch (error) {
        console.error("Error adding marker:", error, location);
      }
    });
  }, [locations, mapReady]);

  const DeploymentItem = ({ deployment, isActive }) => (
    <Card
      withBorder
      mb="xs"
      component={Link}
      href={`/cameratrap/deployment/edit/${deployment._id}`}
      sx={{ cursor: "pointer" }}
    >
      <Stack spacing="xs">
        <Group position="apart">
          <Group spacing="xs">
            <IconCamera size={16} />
            <Text size="sm" weight={500}>
              {deployment.cameraId.name}
            </Text>
            {deployment.cameraId.manufacturer && (
              <Text size="xs" c="dimmed">
                {deployment.cameraId.manufacturer}
              </Text>
            )}
            {deployment.cameraId.model && (
              <Text size="xs" c="dimmed">
                {deployment.cameraId.model}
              </Text>
            )}
          </Group>
          <Group spacing="xs">
            <Badge color={isActive ? "green" : "gray"}>
              {isActive ? "Active" : "Inactive"}
            </Badge>
          </Group>
        </Group>
        <Group spacing="xs">
          <IconCalendar size={16} />
          <Text size="sm">
            {new Date(deployment.deploymentStart).toLocaleDateString()}
            {deployment.deploymentEnd
              ? ` - ${new Date(deployment.deploymentEnd).toLocaleDateString()}`
              : " - Present"}
          </Text>
        </Group>
        {deployment.setupBy && (
          <Text size="sm" color="dimmed">
            Setup by: {deployment.setupBy}
          </Text>
        )}
      </Stack>
    </Card>
  );

  return (
    <>
      <Card withBorder>
        <div className={classes.mapContainer}>
          <SegmentedControl
            className={classes.styleSwitch}
            value={mapStyle}
            onChange={setMapStyle}
            data={[
              { label: "Outdoors", value: "outdoors-v12" },
              { label: "Streets", value: "streets-v11" },
              { label: "Standard", value: "standard" },
              { label: "Satellite", value: "satellite-v9" },
              { label: "Satellite Streets", value: "satellite-streets-v12" },
            ]}
          />
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

      <Drawer
        opened={!!selectedLocation}
        onClose={() => setSelectedLocation(null)}
        position="right"
        size="md"
        title={
          <Group position="apart">
            <Title order={3}>{selectedLocation?.locationName}</Title>
            <ActionIcon onClick={() => setSelectedLocation(null)}>
              <IconX size={18} />
            </ActionIcon>
          </Group>
        }
      >
        {selectedLocation && (
          <Stack>
            {/* Location Details */}
            <Card withBorder>
              <Stack spacing="xs">
                {selectedLocation.projectArea && (
                  <Text>Project Area: {selectedLocation.projectArea}</Text>
                )}
                {selectedLocation.zone && (
                  <Text>Zone: {selectedLocation.zone}</Text>
                )}
                {selectedLocation.notes && (
                  <Text>Notes: {selectedLocation.notes}</Text>
                )}
              </Stack>
            </Card>

            {/* Active Deployments */}
            {selectedLocation.deployments.active.length > 0 && (
              <>
                <Title order={4}>Active Deployments</Title>
                {selectedLocation.deployments.active.map((deployment) => (
                  <DeploymentItem
                    key={deployment._id}
                    deployment={deployment}
                    isActive={true}
                  />
                ))}
              </>
            )}

            {/* Inactive Deployments */}
            {selectedLocation.deployments.inactive.length > 0 && (
              <>
                <Title order={4}>Previous Deployments</Title>
                {selectedLocation.deployments.inactive.map((deployment) => (
                  <DeploymentItem
                    key={deployment._id}
                    deployment={deployment}
                    isActive={false}
                  />
                ))}
              </>
            )}
          </Stack>
        )}
      </Drawer>
    </>
  );
}
