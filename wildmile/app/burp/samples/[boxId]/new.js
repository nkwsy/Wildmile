"use client";
import React, { useRef, useEffect, useState } from "react";
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
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
// import Router from "next/router";
import { useRouter } from "next/router";
import SampleForm from "components/macros/sample_form";
// import dbConnect from "/lib/db/setup";
import mapboxgl from "!mapbox-gl";
import {
  getExistingLocations,
  createMacroSample,
} from "app/actions/MacroActions";

// mapboxgl.accessToken = process.env.MAPBOX_KEY;

export default function CreateLog() {
  const [errorMsg, setErrorMsg] = useState("");
  const [active, setActive] = useState(0);
  const [visible, handlers] = useDisclosure(false);
  const [loading, { toggle }] = useDisclosure();

  const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  // const router = useRouter();
  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const form = useForm({
    initialValues: {
      boxNum: 0,
      samplingPeriod: 0,
      dateDeployed: null,
      dateCollected: null,
      location: null,
      treatment: [],
      replicateNumber: 0,
      depth: 0,
      substrate: "",
      // canopy: false,
      // numberOfCSO: 0,
      notes: "",
      // coordinates: [],
    },
  });

  async function createLog() {
    // handlers.open();
    toggle();
    console.log(form.values);
    const res = await createMacroSample(form.values);
  }

  return (
    <Container my="5rem">
      <Title mt={"xl"} align="center">
        Create a new Sample
      </Title>
      <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
        <Box m="md" flex>
          <SampleForm form={form} />
          <Button justify="flex-right" onClick={createLog} loading={loading}>
            Submit
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
