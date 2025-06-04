import { Suspense } from "react";
import { Container, Loader } from "@mantine/core";
import LocationSidebar from "/components/cameratrap/locations/LocationSidebar";
import LocationContent from "/components/cameratrap/locations/LocationContent";

export const metadata = {
  title: "Wildlife Camera Research Platform - Location Management",
};

export default function LocationsPage() {
  return (
    <Container
      fluid
      p={0}
      style={{ display: "flex", height: "calc(100vh - 60px)" }}
    >
      <Suspense fallback={<Loader />}>
        <LocationSidebar />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <LocationContent />
      </Suspense>
    </Container>
  );
}
