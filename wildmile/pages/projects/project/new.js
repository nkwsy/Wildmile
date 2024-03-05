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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import Router from "next/router";
import ProjectForm from "components/project_form";
import dbConnect from "/lib/db/setup";
import mapboxgl from "!mapbox-gl";

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
      name: "",
      description: "",
      notes: "",
    },
  });

  async function createLog() {
    handlers.open();
    console.log(form.values);
    const res = await fetch("/api/project/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.values),
    });

    if (res.status === 201) {
      Router.push("/projects");
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

  return (
    <Container visibleFrom="md" maw="95%" my="6rem">
      <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
        <Title mb={30} align="center">
          Create a new Project
        </Title>
        <ProjectForm form={form} />
        <Group justify="right" mt="md">
          <Button onClick={createLog}>Submit</Button>
        </Group>
      </Paper>
    </Container>
  );
}

export async function getStaticProps() {
  await dbConnect();

  /* find all the data in our database */

  return { props: {} };
}
