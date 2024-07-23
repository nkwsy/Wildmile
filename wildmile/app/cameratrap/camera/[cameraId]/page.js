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
import CameraForm from "components/cameratrap/CameraForm";
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
    <Container>
      <Title mb={30} align="center">
        Edit Camera
      </Title>
      <CameraForm />
    </Container>
  );
}
