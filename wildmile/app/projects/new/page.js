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
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
// import Router from "next/router";
import ProjectForm from "components/project_form";
import dbConnect from "/lib/db/setup";
import mapboxgl from "!mapbox-gl";

mapboxgl.accessToken = process.env.MAPBOX_KEY;

export default function Page() {
  // const [errorMsg, setErrorMsg] = useState("");
  // const [active, setActive] = useState(0);
  // const [visible, handlers] = useDisclosure(false);

  // const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  // function scrollToTop() {
  //   if (!isBrowser()) return;
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }

  async function createProject(formData) {}

  return (
    <Container visibleFrom="md" maw="95%" my="6rem">
      <Title mb={30} align="center">
        Create a new Project
      </Title>
      <ProjectForm />
    </Container>
  );
}
