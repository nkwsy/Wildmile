"use client";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import classes from "./LocationsMap.module.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

export default function LocationsMap({
  locations = [],
  selectedLocation,
  onLocationSelect,
}) {
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

    // Wait for map to load before setting it to ref and adding controls
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

    // Add new markers
    locations.forEach((location) => {
      if (!location.location?.coordinates) return;

      const coordinates = location.location.coordinates;
      if (!Array.isArray(coordinates) || coordinates.length !== 2) return;

      try {
        const el = document.createElement("div");
        el.className = `${classes.marker} ${
          selectedLocation?._id === location._id ? classes.selected : ""
        }`;

        const marker = new mapboxgl.Marker(el)
          .setLngLat(coordinates)
          .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(`
              <strong>${location.locationName}</strong>
              ${location.notes ? `<p>${location.notes}</p>` : ""}
            `)
          )
          .addTo(map.current);

        el.addEventListener("click", () => {
          onLocationSelect?.(location);
        });

        markersRef.current[location._id] = marker;
      } catch (error) {
        console.error("Error adding marker:", error, location);
      }
    });
  }, [locations, selectedLocation, mapReady]);

  // Handle selected location
  useEffect(() => {
    if (!mapReady || !map.current || !selectedLocation?.location?.coordinates)
      return;

    Object.entries(markersRef.current).forEach(([id, marker]) => {
      const el = marker.getElement();
      if (id === selectedLocation._id) {
        el.classList.add(classes.selected);
        map.current.flyTo({
          center: selectedLocation.location.coordinates,
          zoom: 15,
        });
      } else {
        el.classList.remove(classes.selected);
      }
    });
  }, [selectedLocation, mapReady]);

  return (
    <div className={classes.mapContainer}>
      <div ref={mapContainer} className={classes.map} />
    </div>
  );
}
