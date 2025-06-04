import { Button, Stack } from '@mantine/core';
import { IconLocation } from "@tabler/icons-react";
import { useState } from 'react';

export default function MyLocationButton(onLocationSelect = () => {}) {
    // Check if geolocation is available
    function isGeolocationAvailable() {
        return "geolocation" in navigator;
    }
    // Use Browser GeoLocation API to get the current location
    const getLocation = () => {
        if (isGeolocationAvailable()) {
            navigator.geolocation.getCurrentPosition(showPosition, showError, geoOptions);
        } else {
            alert("Geolocation is not supported by this browser.");
        }
    }
    // ask for permission to get the current location
    const showPosition = (position) => {
        if (position && onLocationSelect) {
            onLocationSelect({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        }
        console.log("Latitude: " + position.coords.latitude +
            "Longitude: " + position.coords.longitude);
    }

    const showError = (error) => {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert("User denied the request for Geolocation.");
                break;
            case error.POSITION_UNAVAILABLE:
                alert("Location information is unavailable.");
                break;
            case error.TIMEOUT:
                alert("The request to get user location timed out.");
                break;
            case error.UNKNOWN_ERROR:
                alert("An unknown error occurred.");
                break;
        }
    };

    const geoOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
    };

    return (
        <>
            <Stack
                align="stretch"
                justify="center"
                gap="md"
                >
                   {location.latitude && location.longitude && (
                    <p>
                        Latitude: {location.latitude}, Longitude: {location.longitude}
                    </p>)}
                <Button
                    onClick={getLocation}
                    justify="center"
                    fullWidth
                    variant="gradient"
                    leftSection={<IconLocation size={20} />}
                    gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
                >
                Get My Current Location
                </Button>
            </Stack>
        </>
    );
};