import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Loader } from "@mantine/core";
import LocationDetails from "/components/cameratrap/locations/LocationDetails";
import LocationSidebar from "/components/cameratrap/locations/LocationSidebar";
import {
  getLocationById,
  getExistingLocations,
} from "app/actions/CameratrapActions";
// This is a server component that will fetch the location data
async function getLocationData(locationId) {
  try {
    const locationDataJson = await getLocationById(locationId);

    // Parse the JSON string if it's not null
    if (locationDataJson) {
      return JSON.parse(locationDataJson);
    }
    return null;
  } catch (error) {
    console.error("Error fetching location data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locationId } = await params;
  const locationData = await getLocationData(locationId);

  if (!locationData) {
    return {
      title: "Location Not Found",
    };
  }

  return {
    title: `${locationData.locationName} - Wildlife Camera Research Platform`,
  };
}

export default async function LocationPage({ params }) {
  const { locationId } = await params;

  // Use absolute URL with origin for server components
  const locationData = await getLocationData(locationId);

  if (!locationData) {
    notFound();
  }

  return (
    <Container
      fluid
      p={0}
      style={{ display: "flex", height: "calc(100vh - 60px)" }}
    >
      {/* <Suspense fallback={<Loader />}> */}
      <LocationSidebar activeLocationId={locationId} />
      {/* </Suspense> */}
      <Suspense fallback={<Loader />}>
        <LocationDetails location={locationData} />
      </Suspense>
    </Container>
  );
}
