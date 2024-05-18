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
import Router from "next/router";
import SampleForm from "components/macros/sample_form";
// import dbConnect from "/lib/db/setup";
import mapboxgl from "!mapbox-gl";
import { getExistingLocations } from "app/actions/MacroActions";

mapboxgl.accessToken = process.env.MAPBOX_KEY;

export default function CreateLog() {
  const [errorMsg, setErrorMsg] = useState("");
  const [active, setActive] = useState(0);
  const [visible, handlers] = useDisclosure(false);

  const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

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
      locationName: "",
      treatment: [],
      replicateNumber: 0,
      depth: 0,
      substrate: "",
      canopy: false,
      numberOfCSO: 0,
      notes: "",
      coordinates: [],
    },
  });

  // Use the databaseInput object to store the form data in the database
  async function getLocations() {
    // const res = await getExistingLocations();
    const locations = {};
    // const locations = await res;
    return locations;
  }
  async function createLog() {
    handlers.open();
    console.log(form.values);
    const res = await fetch("/api/macros", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.values),
    });

    if (res.status === 201) {
      Router.push("/burp");
    } else {
      handlers.close();
      setErrorMsg(await res.text());
    }

    // Get the _id from the server response
    // const data = await res.json();
    // const id = data._id;

    // Navigate to the trash/edit/[id].js page
    // Router.push(`/projects`);
  }
  const existingLocations = getLocations();

  return (
    <Container my="5rem">
      <Title mt={"xl"} align="center">
        Create a new Sample
      </Title>
      <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
        <Box m="md" flex>
          <SampleForm form={form} existingLocations={existingLocations} />
          <Button justify="flex-right" onClick={createLog}>
            Submit
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}
