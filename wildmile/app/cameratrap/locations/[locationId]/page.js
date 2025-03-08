import { notFound } from "next/navigation";
import { Suspense } from "react";
import { Container, Loader } from "@mantine/core";
import ServerLocationSidebar from "components/cameratrap/locations/ServerLocationSidebar";
import LocationDetails from "components/cameratrap/locations/LocationDetails";

// This is a server component that will fetch the location data
async function getLocationData(locationId) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/cameratrap/locations/${locationId}`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Error fetching location data:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { locationId } = params;
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
  const { locationId } = params;
  
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
      <Suspense fallback={<Loader />}>
        <ServerLocationSidebar activeLocationId={locationId} />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <LocationDetails location={locationData} />
      </Suspense>
    </Container>
  );
}
