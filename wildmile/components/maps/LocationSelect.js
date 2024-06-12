"use client";
import React, { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "mapbox-gl/dist/mapbox-gl.css";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import classes from "/styles/map.module.css";
import { Select } from "@mantine/core";
// import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
// mapboxgl.accessToken = 'YOUR_MAPBOX_ACCESS_TOKEN';
function updateArea(e) {}

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

// export function LocationDropdown({
//   locations,
//   selectedLocation,
//   setSelectedLocation,
// }) {
//   mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;
//   const [lng, setLng] = useState(-87.65);
//   const [lat, setLat] = useState(41.9);
//   const [currentLocations, setCurrentLocations] = useState(locations);
//   const [selectedMarker, setSelectedMarker] = useState(null);
//   const [previousMarker, setPreviousMarker] = useState(null);
//   const mapContainer = useRef(null);
//   const map = useRef(null);
//   //   const [selectedLocation, setSelectedLocation] = useState(null);

//   useEffect(() => {
//     if (map.current) return; // Initialize map only once
//     map.current = new mapboxgl.Map({
//       container: mapContainer.current,
//       style: "mapbox://styles/mapbox/streets-v11",
//       center: [lng, lat],
//       zoom: 9,
//     });
//   }, []);

//   useEffect(() => {
//     // Update marker position when selectedLocation changes
//     if (selectedLocation) {
//       // map.current.markerSelected;
//       console.log("Selected Location:", selectedLocation);
//       let elements = document.getElementsByClassName(classes.markerSelected);
//       for (let i = 0; i < elements.length; i++) {
//         elements[i].className = classes.markerSelected;
//       }
//       console.log("Selected elements:", elements, classes.markerSelected);
//       let element = document.getElementById(selectedLocation._id);
//       element.className = classes.markerSelected;
//       console.log("Selected element:", element);

//       map.current.flyTo({
//         center: selectedLocation.location.coordinates,
//         zoom: 18,
//       });
//     } else {
//       console.log("No location selected");
//     }
//   }, [selectedLocation]);

//   useEffect(() => {
//     if (!map.current) return; // Wait for map to initialize
//     map.current.on("click", (e) => {
//       const features = map.current.queryRenderedFeatures(e.point);
//       // e.features[0].className = classes.markerSelected;
//       console.log(e);
//     });
//     if (locations && locations.length > 0) {
//       console.log("Locations:", locations);
//       locations.forEach((location) => {
//         const el = document.createElement("div");
//         el.className = classes.markerSelected;
//         el.id = location._id;

//         el.addEventListener("click", () => {
//           console.log("Clicked:", el.id);
//           setSelectedLocation(location);
//         });
//         const popup = new mapboxgl.Popup({ offset: 25 }).setText(
//           location.locationName
//         );
//         new mapboxgl.Marker(el)
//           .setLngLat(location.location.coordinates)
//           .setPopup(popup)
//           .addTo(map.current);
//       });

//       // setCurrentLocations(locations);
//     }
//   }, [locations]);

//   return (
//     <div>
//       {/* <Select
//         data={currentLocations}
//         value={selectedLocation}
//         onChange={(option) => {
//           setSelectedLocation(option);
//           onSelect(option);
//         }}
//         // getOptionLabel={(option) => option.name}
//         // getOptionValue={(option) => option.id}
//       /> */}
//       <div ref={mapContainer} className={classes.map}></div>
//     </div>
//   );
// }

// map.module.css
// .marker {
//   background-color: blue;
//   border-radius: 50%;
//   width: 20px;
//   height: 20px;
// }

// .markerSelected {
//   background-color: red;
//   border-radius: 50%;
//   width: 20px;
//   height: 20px;
// }

export function LocationDropdown({
  locations,
  selectedLocation,
  setSelectedLocation,
}) {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const [lng, setLng] = useState(-87.65);
  const [lat, setLat] = useState(41.9);
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: 9,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return; // Wait for map to initialize
    if (locations && locations.length > 0) {
      // Clear existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add new markers
      const markers = locations.map((location) => {
        const el = document.createElement("div");
        el.className = classes.marker;
        el.id = location._id;

        // el.addEventListener("click", () => {
        //   setSelectedLocation(location);
        // });

        const popup = new mapboxgl.Popup({ offset: 25 }).setText(
          location.locationName
        );

        const marker = new mapboxgl.Marker(el)
          .setLngLat(location.location.coordinates)
          .setPopup(popup)
          .addTo(map.current);

        markersRef.current.push(marker);
        return marker;
      });

      markersRef.current = markers;
    }
  }, [locations]);

  useEffect(() => {
    if (!map.current) return; // Wait for map to initialize

    if (selectedLocation) {
      markersRef.current.forEach((marker) => {
        const markerEl = marker;
        if (
          markerEl.id === selectedLocation ||
          markerEl.id === selectedLocation._id
        ) {
          console.log("Selected marker:", markerEl);
          markerEl.addClassName(classes.markerSelected);
        } else {
          markerEl.addClassName(classes.marker);
        }
      });

      map.current.flyTo({
        center: selectedLocation.location.coordinates,
        zoom: 18,
      });
    }
  }, [selectedLocation]);

  return (
    <div>
      <div ref={mapContainer} className={classes.map}></div>
    </div>
  );
}

const LocationMap = ({ onPointSelect, onPolygonSelect, existingLocations }) => {
  mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_KEY;
  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(-87.65);
  const [lat, setLat] = useState(41.9);
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
    // styles: pointStyle,
  });
  useEffect(() => {
    if (map.current) return; // Initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: 9,
    });

    map.current.addControl(Draw, "top-left");
    map.current.on("draw.create", function (e) {
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
      });
    });
  }, []);

  return (
    <div
      ref={mapContainer}
      className={classes.map}
      // style={{ height: "400px", width: "100%" }}
    />
  );
};

export default LocationMap;
