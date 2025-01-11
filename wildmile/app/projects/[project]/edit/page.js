"use client";
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

// import ProjectForm from "components/project_form";
// import dbConnect from "/lib/db/setup";
// import mapboxgl from "!mapbox-gl";
import dynamic from "next/dynamic";

const ProjectForm = dynamic(() => import("components/project_form"), {
  ssr: false,
});

// mapboxgl.accessToken = process.env.MAPBOX_KEY;

export default function Page() {
  // const [errorMsg, setErrorMsg] = useState("");
  // const [active, setActive] = useState(0);
  // const [visible, handlers] = useDisclosure(false);

  // const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  // function scrollToTop() {
  //   if (!isBrowser()) return;
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }

  return (
    <>
      <Container>
        <Title mb={30} align="center">
          Edit Project
        </Title>
        <ProjectForm />
      </Container>
    </>
  );
}
