"use client";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
// import classes from "./LocationsMap.module.css";
import classes from "/components/cameratrap/deployments/DeploymentMap.module.css";

import { TextInput, Group, Button, SegmentedControl } from "@mantine/core";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export default function SelectLocationMap({
  initialCoordinates,
  onLocationSelect,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapReady, setMapReady] = useState(false);
  const [mapStyle, setMapStyle] = useState("outdoors-v12");

  const [lng] = useState(-87.65);
  const [lat] = useState(41.9);
  const [zoom] = useState(15);
  const [manualCoords, setManualCoords] = useState("");

  // Initialize map
  useEffect(() => {
    if (map.current) return;

    const initializeMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center:
        initialCoordinates?.length === 2 ? initialCoordinates : [lng, lat],
      zoom: zoom,
    });

    initializeMap.on("load", () => {
      map.current = initializeMap;
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");
      setMapReady(true);
    });

    // Add click handler
    initializeMap.on("click", (e) => {
      const coordinates = [e.lngLat.lng, e.lngLat.lat];
      updateMarker(coordinates);
      onLocationSelect?.(coordinates);
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

  // Handle initial coordinates
  useEffect(() => {
    if (!mapReady || !map.current) return;

    if (initialCoordinates?.length === 2) {
      updateMarker(initialCoordinates);
      map.current.flyTo({
        center: initialCoordinates,
        // zoom: 15,
      });
    }
  }, [initialCoordinates, mapReady]);

  const updateMarker = (coordinates) => {
    if (marker.current) {
      marker.current.remove();
    }

    const el = document.createElement("div");
    el.className = classes.marker;

    marker.current = new mapboxgl.Marker(el)
      .setLngLat(coordinates)
      .addTo(map.current);
  };

  const handleManualCoordinates = () => {
    // Split the input and clean up whitespace
    const [lngStr, latStr] = manualCoords.split(",").map((s) => s.trim());
    const lng = parseFloat(lngStr);
    const lat = parseFloat(latStr);

    // Validate coordinates
    if (
      isNaN(lng) ||
      isNaN(lat) ||
      lng < -180 ||
      lng > 180 ||
      lat < -90 ||
      lat > 90
    ) {
      alert("Please enter valid coordinates in format: longitude, latitude");
      return;
    }

    const coordinates = [lng, lat];
    updateMarker(coordinates);
    onLocationSelect?.(coordinates);

    map.current.flyTo({
      center: coordinates,
      // zoom: 15,
    });
  };

  return (
    <>
      <div className={classes.mapContainer}>
        <div ref={mapContainer} className={classes.map} />

        <SegmentedControl
          className={classes.styleSwitch}
          value={mapStyle}
          onChange={setMapStyle}
          data={[
            { label: "Outdoors", value: "outdoors-v12" },
            { label: "Satellite ", value: "satellite-streets-v12" },
          ]}
        />
      </div>
      <Group mt="sm">
        <TextInput
          label="Coordinates"
          placeholder="-87.65, 41.9"
          description="Format: longitude, latitude"
          value={manualCoords}
          onChange={(e) => setManualCoords(e.target.value)}
          style={{ flex: 1 }}
        />
        <Button onClick={handleManualCoordinates} style={{ marginTop: "auto" }}>
          Set Location
        </Button>
      </Group>
    </>
  );
}
