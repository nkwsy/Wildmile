import { Suspense } from "react";
import { Container, Loader } from "@mantine/core";
import ServerLocationSidebar from "/components/cameratrap/locations/ServerLocationSidebar";
import LocationsContent from "/components/cameratrap/locations/LocationContent";

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
        <ServerLocationSidebar />
      </Suspense>
      <Suspense fallback={<Loader />}>
        <LocationsContent />
      </Suspense>
    </Container>
  );
}
