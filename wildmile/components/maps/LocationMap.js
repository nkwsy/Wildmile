// components/LocationMap.js
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";

// mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const LocationMap = ({ onLocationSelect }) => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-87.65);
  const [lat, setLat] = useState(41.9);
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: 9,
    });

    map.current.on("dblclick", (e) => {
      const { lng, lat } = e.lngLat;
      setLng(lng);
      setLat(lat);
      onLocationSelect({ lng, lat });
    });
  }, []);

  return <div ref={mapContainer} style={{ height: "400px", width: "100%" }} />;
};

export default LocationMap;
