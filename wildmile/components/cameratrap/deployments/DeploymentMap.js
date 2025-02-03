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
  Modal,
  Button,
  Popover,
} from "@mantine/core";
import { IconX, IconCalendar, IconCamera, IconEdit } from "@tabler/icons-react";
import Link from "next/link";
import classes from "./DeploymentMap.module.css";
import { useDeploymentMap } from "./DeploymentMapContext";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export function DeploymentMapObject() {
  const [locations, setLocations] = useState([]);
  const [deployments, setDeployments] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deploymentsRes, locationsRes] = await Promise.all([
          fetch("/api/cameratrap/deployments", {
            next: { tags: ["deployments"] },
          }),
          fetch("/api/cameratrap/deploymentLocations", {
            next: { tags: ["locations"] },
          }),
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

  if (loading) return <LoadingOverlay visible={loading} />;

  return (
    <>
      {/* <LoadingOverlay visible={loading} /> */}
      <DeploymentMap locations={locations} />
    </>
  );
}

export function LocationDrawer() {
  const { selectedLocation, setSelectedLocation } = useDeploymentMap();
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
        {deployment.creator && (
          <Text size="sm" color="dimmed">
            Setup by: {deployment.creator.name}
          </Text>
        )}
      </Stack>
    </Card>
  );

  return (
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
  );
}

export default function DeploymentMap({ locations = [] }) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef({});
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState("outdoors-v12");
  const { selectedLocation, setSelectedLocation } = useDeploymentMap();
  const [hoveredLocation, setHoveredLocation] = useState(null);
  const [lng] = useState(-87.65);
  const [lat] = useState(41.9);
  const [zoom] = useState(9);
  const [showLabels, setShowLabels] = useState(false);
  const labelsRef = useRef({});
  const LABEL_ZOOM_THRESHOLD = 12; // Adjust this value as needed

  console.log("locations", locations);
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

    // Re-add custom layer after style change
    map.current.once("style.load", () => {
      // Only add drone imagery for satellite streets view
      if (mapStyle === "satellite-streets-v12") {
        if (!map.current.getSource("drone-imagery")) {
          map.current.addSource("drone-imagery", {
            type: "raster",
            tiles: [
              "https://public_tiles.dronedeploy.com/v1/tiles_images/66abc7ee3f8af3299aedf542/orthomosaic/{z}/{x}/{y}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjIxNDU5MTY4MDAwMDAsInVzZXJuYW1lIjoibmlja0B1cmJhbnJpdi5vcmciLCJwbGFuX2lkIjoiNjZhYmM3ZWUzZjhhZjMyOTlhZWRmNTQyIiwibGF5ZXIiOiJvcnRob21vc2FpYyJ9.dKgmW0zenzR8XV-74YvmUhRvo0Zq1YBkgAXrrDV_fL1dgJx0-rxKrcHWaI_WRxm2Ivc2kSqWIKmucRyuphLMEQ",
              "https://public_tiles.dronedeploy.com/v1/tiles_images/67381a3b8f4836639c4f2eaf/orthomosaic/{z}/{x}/{y}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjIxNDU5MTY4MDAwMDAsInVzZXJuYW1lIjoibmlja0B1cmJhbnJpdi5vcmciLCJwbGFuX2lkIjoiNjczODFhM2I4ZjQ4MzY2MzljNGYyZWFmIiwibGF5ZXIiOiJvcnRob21vc2FpYyJ9.oylH1nFR7UKcP17OCbTIBDe-TSamjhhqY16z4WAMY6FfcL352iF13dg4UkekrwiNVF7i-GWHjHjCfgzzXhgI1g",
              "https://public_tiles.dronedeploy.com/v1/tiles_images/66832330645d9248355fcde8/orthomosaic/{z}/{x}/{y}?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzUxMiJ9.eyJleHAiOjIxNDU5MTY4MDAwMDAsInVzZXJuYW1lIjoibmlja0B1cmJhbnJpdi5vcmciLCJwbGFuX2lkIjoiNjY4MzIzMzA2NDVkOTI0ODM1NWZjZGU4IiwibGF5ZXIiOiJvcnRob21vc2FpYyJ9.jkanUtiBQ0fm6Xzu50z8AZWCjcnnT9LnwJW6UEgAJYXdlKMhJcWgWAD_eFAhZ0oHOmhXRqt9faJUdsg1IKAJJA",
            ],
            tileSize: 256,
          });

          map.current.addLayer({
            id: "drone-layer",
            type: "raster",
            source: "drone-imagery",
            paint: {
              "raster-opacity": 0.7,
            },
          });
        }
      } else {
        // Remove drone imagery for other map styles
        if (map.current.getSource("drone-imagery")) {
          map.current.removeLayer("drone-layer");
          map.current.removeSource("drone-imagery");
        }
      }
    });
  }, [mapStyle]);

  // Add this effect to handle zoom changes
  useEffect(() => {
    if (!map.current) return;

    const handleZoom = () => {
      const currentZoom = map.current.getZoom();
      setShowLabels(currentZoom >= LABEL_ZOOM_THRESHOLD);
    };

    map.current.on("zoom", handleZoom);

    return () => {
      if (map.current) {
        map.current.off("zoom", handleZoom);
      }
    };
  }, []);

  // Modify the markers effect to include labels
  useEffect(() => {
    if (!mapReady || !map.current || !locations.length) return;

    // Clear existing markers and labels
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    Object.values(labelsRef.current).forEach((label) => label.remove());
    markersRef.current = {};
    labelsRef.current = {};

    const getRandomAngle = () => {
      const angles = [30, 60, 90, -30, -60, -90];
      return angles[Math.floor(Math.random() * angles.length)];
    };

    locations.forEach((location) => {
      if (!location.location?.coordinates) return;

      const coordinates = location.location.coordinates;
      const activeDeployments = location.deployments?.active || [];
      const angle = getRandomAngle();
      const lineLength = 60;

      try {
        // Create marker element
        const el = document.createElement("div");
        el.className = `${classes.marker} ${
          activeDeployments.length > 0 ? classes.active : classes.inactive
        }`;
        el.title = location.locationName;
        el.addEventListener("click", () => setSelectedLocation(location));
        el.addEventListener("mouseenter", () => {
          labelEl.style.opacity = "1";
          labelEl.style.zIndex = "2000";
        });
        el.addEventListener("mouseleave", () => {
          labelEl.style.opacity = "0.5";
          labelEl.style.zIndex = "1000";
        });

        // Create label container
        const labelContainer = document.createElement("div");
        labelContainer.style.position = "relative";
        labelContainer.style.width = "0";
        labelContainer.style.height = "0";

        // Create leader line element
        const lineEl = document.createElement("div");
        // lineEl.className = classes.leaderLine;
        // lineEl.style.height = `${lineLength}px`;
        // lineEl.style.transform = `rotate(${angle}deg)`;

        // Create label element
        const labelEl = document.createElement("div");
        labelEl.className = classes.markerLabel;
        labelEl.textContent = location.locationName;
        labelEl.style.zIndex = 1000;

        // Position label at end of line
        const radians = (angle * Math.PI) / 180;
        // const labelX = Math.sin(radians) * lineLength;
        // const labelY = -Math.cos(radians) * lineLength;

        const offset = 12;
        const labelX = offset;
        const labelY = -offset;

        labelEl.style.transform = `translate(${labelX}px, ${labelY}px)`;

        // Append elements to container
        // labelContainer.appendChild(lineEl);
        labelContainer.appendChild(labelEl);

        // Set initial visibility
        const currentZoom = map.current.getZoom();
        labelContainer.style.display =
          currentZoom >= LABEL_ZOOM_THRESHOLD ? "block" : "none";

        // Create and add marker
        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .addTo(map.current);

        // Create and add label
        const label = new mapboxgl.Marker(labelContainer)
          .setLngLat(coordinates)
          .addTo(map.current);

        const updateLabelVisibility = () => {
          if (!map.current) return;
          const currentZoom = map.current.getZoom();
          labelContainer.style.display =
            currentZoom >= LABEL_ZOOM_THRESHOLD ? "block" : "none";
        };

        map.current.on("move", updateLabelVisibility);
        map.current.on("zoom", updateLabelVisibility);
        updateLabelVisibility();

        markersRef.current[location._id] = marker;
        labelsRef.current[location._id] = label;
      } catch (error) {
        console.error("Error adding marker:", error, location);
      }
    });

    return () => {
      if (map.current) {
        map.current.off("move", null);
        map.current.off("zoom", null);
      }
    };
  }, [locations, mapReady, showLabels]);

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
              { label: "Standard", value: "standard" },
              { label: "Satellite", value: "satellite-streets-v12" },
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
    </>
  );
}

// Map Modal, Make sure you input the context provider in the parent component

export function DeploymentMapModal({ handleFilterChange }) {
  const { selectedLocation, setSelectedLocation } = useDeploymentMap();
  const [opened, setOpened] = useState(false);
  if (selectedLocation) {
    handleFilterChange(selectedLocation);
  }

  return (
    <>
      <Button variant="outline" size="xs" onClick={() => setOpened(true)}>
        Open Map
      </Button>
      <Modal opened={opened} onClose={() => setOpened(false)} title="Map">
        <DeploymentMapObject />
      </Modal>
    </>
  );
}

export function DeploymentMapPopover({ handleFilterChange }) {
  const { selectedLocation, setSelectedLocation } = useDeploymentMap();

  if (selectedLocation) {
    handleFilterChange(selectedLocation);
  }
  return (
    <Popover
      width={600}
      position="bottom"
      clickOutsideEvents={["mouseup", "touchend"]}
    >
      <Popover.Target>
        <Button>Open Map</Button>
      </Popover.Target>
      <Popover.Dropdown>
        <DeploymentMapObject />
      </Popover.Dropdown>
    </Popover>
  );
}
