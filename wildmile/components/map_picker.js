import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "!mapbox-gl"; // eslint-disable-line import/no-webpack-loader-syntax
import ReactDOM from "react-dom";
// import Map from "react-map-gl";

console.log("mapboxgl.accessToken", mapboxgl.accessToken);
console.log("process.env.MAPBOX_KEY", process.env.MAPBOX_KEY);
export default function MapPicker() {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-87.65);
  const [lat, setLat] = useState(41.9);
  const [zoom, setZoom] = useState(12);
  const [selectedMarker, setSelectedMarker] = useState(null);
  const mapRef = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [lng, lat],
      zoom: zoom,
    });

    const marker = new mapboxgl.Marker()
      .setLngLat(map.current.getCenter())
      .addTo(map.current);
    map.current.on("move", () => {
      setLng(map.current.getCenter().lng.toFixed(6));
      setLat(map.current.getCenter().lat.toFixed(6));
      setZoom(map.current.getZoom().toFixed(2));
      marker.setLngLat(map.current.getCenter());
    });
    // Add this

    // map.current.on("dblclick", function (e) {
    //   console.log("A double click occurred at " + JSON.stringify(e.lngLat));
    // });
  });

  return (
    <div>
      <div className="sidebar">
        Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
      </div>
      <div ref={mapContainer} className="map-container" />
    </div>
  );
}
