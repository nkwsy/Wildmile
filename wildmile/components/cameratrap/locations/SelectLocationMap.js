"use client";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import classes from "./LocationsMap.module.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export default function SelectLocationMap({
  initialCoordinates,
  onLocationSelect,
}) {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const [mapReady, setMapReady] = useState(false);

  const [lng] = useState(-87.65);
  const [lat] = useState(41.9);
  const [zoom] = useState(15);

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

  // Handle initial coordinates
  useEffect(() => {
    if (!mapReady || !map.current) return;

    if (initialCoordinates?.length === 2) {
      updateMarker(initialCoordinates);
      map.current.flyTo({
        center: initialCoordinates,
        zoom: 15,
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

  return (
    <div className={classes.mapContainer}>
      <div ref={mapContainer} className={classes.map} />
      <div className={classes.instructions}>
        Click on the map to select a location
      </div>
    </div>
  );
}
