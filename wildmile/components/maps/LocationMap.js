import React, { useRef, useEffect, useState, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import classes from "styles/map.module.css";

import styles from "./LocationMap.module.css";
// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';

const pointStyle = [
  {
    id: "highlight-active-points",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["==", "meta", "feature"],
      ["==", "active", "true"],
    ],
    paint: {
      "circle-radius": 7,
      "circle-color": "#000000",
    },
  },
  {
    id: "points-are-blue",
    type: "circle",
    filter: [
      "all",
      ["==", "$type", "Point"],
      ["==", "meta", "feature"],
      ["==", "active", "false"],
    ],
    paint: {
      "circle-radius": 5,
      "circle-color": "#000088",
    },
  },
];

const LocationMap = ({ onPointSelect, onPolygonSelect, existingLocations }) => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const mapContainer = useRef(null);
  // default center to be wild mile location
  const [lng, setLng] = useState(-87.6521);
  const [lat, setLat] = useState(41.9068);
  const [zoom, setZoom] = useState(17);
  const [marker, setMarker] = useState(null);
  const [point, setPoint] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [existingPoints, setExistingPoints] = useState([]);
  const [existingPolygons, setExistingPolygons] = useState([]);
  let usePoints = false;
  let usePolygons = false;
  useEffect(() => {
    if (existingLocations) {
      const points = existingLocations.filter(
        (location) => location.type === "Point"
      );
      setPoint(points);
      const polygons = existingLocations.filter(
        (location) => location.type === "Polygon"
      );
      setExistingPoints(points);

      setExistingPolygons(polygons);
    }
  }, [existingLocations]);

  // Check if onPointSelect is a function
  if (typeof onPointSelect === "function") {
    usePoints = true;
  }
  // Check if onPolygonSelect is a function
  if (typeof onPolygonSelect === "function") {
    usePolygons = true;
  }
  let Draw = new MapboxDraw({
    controls: { point: usePoints, polygon: usePolygons, trash: true },
    displayControlsDefault: false,
    styles: pointStyle,
  });
  const updateArea = function (e) {
      console.log(e.features);
      console.log(Draw.getAll());
      if (e.features[0].geometry.type === "Polygon") {
        setPolygon(e.features[0]);
        onPolygonSelect(e.features[0].geometry.coordinates);
      }
      if (e.features[0].geometry.type === "Point") {
        setPoint(e.features[0]);
        onPointSelect(e.features[0].geometry.coordinates);
      }
      let newId = e.features[0].id;
      const data = Draw.getAll();
      // Remove all points except the last one added
      data.features.forEach((feature) => {
        if (feature.geometry.type === "Point" && feature.id !== newId) {
          Draw.delete(feature.id);
        }
        if (feature.geometry.type === "Polygon" && feature.id !== newId) {
          Draw.delete(feature.id);
        }
      })
  };

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: zoom,
    });

    map.addControl(Draw, "top-left");
    map.on("draw.create", updateArea);
    map.on("draw.delete", updateArea);
    map.on("draw.update", updateArea);
    map.on('move', () => {
      setLng(map.getCenter().lng.toFixed(4));
      setLat(map.getCenter().lat.toFixed(4));
      setZoom(map.getZoom().toFixed(2));
    });
    return () => map.remove();
  }, []);
  
  return (
    <>
      <div className={styles.container}>
        <div className={styles.sidebarStyle}>
          <div>
            Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
          </div>
        </div>
        <div
          ref={mapContainer}
          className={classes.map}
          // style={{ height: "400px", width: "100%" }}
        />
      </div>
    </>
  );
};

export default LocationMap;
