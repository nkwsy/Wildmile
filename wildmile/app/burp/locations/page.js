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
// import ProjectForm from "components/project_form";
import LocationForm from "components/macros/LocationForm";
import dbConnect from "/lib/db/setup";
import mapboxgl from "!mapbox-gl";
import { getSession } from "lib/getSession";
import { cookies, headers } from "next/headers";
import { AlertLogin } from "components/alert";

mapboxgl.accessToken = process.env.MAPBOX_KEY;

export const metadata = {
  title: "B.U.R.P. - Macro Sample Location Form",
  description: "Create a new Macro Sample Location",
};

export default async function Page() {
  const session = await getSession({ headers });
  if (!session) return <AlertLogin />;
  // const [errorMsg, setErrorMsg] = useState("");
  // const [active, setActive] = useState(0);
  // const [visible, handlers] = useDisclosure(false);

  // const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  // function scrollToTop() {
  //   if (!isBrowser()) return;
  //   window.scrollTo({ top: 0, behavior: "smooth" });
  // }

  // async function createProject(formData) {}

  return (
    <Container>
      <Title mb={30} align="center">
        Create a new Macro Sample Location
      </Title>
      <LocationForm />
    </Container>
  );
}
