import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import classes from "styles/deploymentMap.module.css";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;

const DeploymentLocationMap = ({ location }) => {
  const mapContainer = useRef(null);
  const [lng, setLng] = useState(location?.coordinates[0] || -87.6521);
  const [lat, setLat] = useState(location?.coordinates[1] || 41.9068);
  const [zoom, setZoom] = useState(15);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    // Add marker if location exists
    if (location?.coordinates) {
      new mapboxgl.Marker()
        .setLngLat([location.coordinates[0], location.coordinates[1]])
        .addTo(map);
    }

    // Add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), "top-right");

    map.on("move", () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });

    return () => map.remove();
  }, [location]);

  return (
    <div className={classes.mapContainer}>
      <div className={classes.coordinateDisplay}>
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className={classes.mapContent} />
    </div>
  );
};

export default DeploymentLocationMap;
