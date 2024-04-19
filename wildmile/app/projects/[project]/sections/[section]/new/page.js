import React from "react";
import {
  Stepper,
  Button,
  Group,
  Textarea,
  NumberInput,
  Paper,
  Title,
  Container,
  Select,
  LoadingOverlay,
  Affix,
} from "@mantine/core";

import SectionForm from "components/projects/section_form";
import mapboxgl from "!mapbox-gl";

mapboxgl.accessToken = process.env.MAPBOX_KEY;

export default function Page() {
  return (
    <Container visibleFrom="md" maw="95%" my="6rem">
      <Title mb={30} align="center">
        Create a new Section
      </Title>
      <SectionForm />
    </Container>
  );
}
