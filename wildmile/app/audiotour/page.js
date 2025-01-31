"use client";

import { useEffect, useState, useRef } from "react";

const pointsOfInterest = [
  {
    id: "zoneA",
    lat: 40.12345,
    lng: -74.56789,
    radius: 15, // meters
    audioSrc: "/audio/zoneA.mp3"
  },
  {
    id: "zoneB",
    lat: 40.1238,
    lng: -74.5683,
    radius: 20,
    audioSrc: "/audio/zoneB.mp3"
  },
  // ... add more as needed
];

export default function Page() {
  const [coords, setCoords] = useState(null);
  const [currentZone, setCurrentZone] = useState(null);
  const audioRef = useRef(null);

  // Calculate distance between two lat/lng points (Haversine formula)
  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371e3; // Earth radius in meters
    const toRad = (x) => (x * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;

    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // Store only serializable data in state
          setCoords({ lat: latitude, lng: longitude });
        },
        (error) => {
          // Log only serializable data from the error
          console.error("Geolocation error:", {
            code: error.code,
            message: error.message
          });
        },
        { enableHighAccuracy: true }
      );

      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  useEffect(() => {
    if (!coords) return;

    let enteredZone = null;
    pointsOfInterest.forEach((poi) => {
      const dist = getDistance(coords.lat, coords.lng, poi.lat, poi.lng);
      if (dist <= poi.radius) enteredZone = poi;
    });

    if (enteredZone && enteredZone.id !== currentZone?.id) {
      // User enters a new zone
      setCurrentZone(enteredZone);
      if (audioRef.current) {
        audioRef.current.src = enteredZone.audioSrc;
        audioRef.current
          .play()
          .catch((err) => console.error("Audio playback error:", err));
      }
    } else if (!enteredZone && currentZone) {
      // User leaves the zone
      setCurrentZone(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = "";
      }
    }
  }, [coords, currentZone]);

  return (
    <main>
      <h1>Park Audio Tour</h1>
      <p>Your Location: {coords ? `${coords.lat}, ${coords.lng}` : "Loading..."}</p>
      <audio ref={audioRef} />
    </main>
  );
}

/*
TEST CASES
---------
You can place these in a separate file (e.g., __tests__/distance.test.js).
They use Jest to confirm getDistance returns the expected values.

import { describe, it, expect } from "@jest/globals";
import { getDistance } from "../app/tour/page"; // Adjust the import path as needed

describe("getDistance function", () => {
  it("returns 0 for identical coords", () => {
    const dist = getDistance(40.0, -74.0, 40.0, -74.0);
    expect(dist).toBeCloseTo(0);
  });

  it("returns a small distance for two nearly identical coords", () => {
    const dist = getDistance(40.12345, -74.56789, 40.12346, -74.56789);
    expect(dist).toBeGreaterThan(0);
    expect(dist).toBeLessThan(2);
  });

  it("returns a larger distance for farther apart coords", () => {
    const dist = getDistance(40.0, -74.0, 41.0, -74.0);
    // ~111 km difference in latitude
    expect(dist).toBeGreaterThan(100000);
  });
});
*/
