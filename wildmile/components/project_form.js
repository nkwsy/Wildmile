"use client";
import { Children, useState, useEffect } from "react";
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
  TagsInput,
  TextInput,
  Box,
  Grid,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";
import { newEditProject, getProject } from "/app/actions";
// import LocationModal from "./maps/LocationModal";
import LocationMap from "./maps/LocationMap";
import { get } from "mongoose";

export default function ProjectForm(props) {
  const [loading, { toggle }] = useDisclosure();
  const [point, setPoint] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  console.log("Pathname:", pathname, params);
  // ...

  const form = useForm({
    // mode: "uncontrolled",

    initialValues: {
      name: "",
      description: "",
      notes: "",
      authorizedUsers: [],
      // location: {
      //   type: "Point",
      //   coordinates: [],
      // },
      // locationBoundry: {
      //   type: "Polygon",
      //   coordinates: [],
      // },
    },
  });

  useEffect(() => {
    if (params.project) {
      const fetchData = async () => {
        const project_result = await getProject(params.project);
        const result = JSON.parse(project_result);
        // if (result && result.data) {
        console.log("Data loaded:", result);
        form.initialize(result);
        form.setValues({
          // ...form.values, // Default values for the form
          ...result, // Data fetched from the server
        });
        // } else {
        //   console.error("Failed to fetch data or data is empty:", result);
        // }
      };

      fetchData();
    }
  }, [params]); // Ensure to depend on params.project

  async function submitForm() {
    // loading(true);
    toggle();
    if (point) {
      form.values.location = {
        type: "Point",
        coordinates: point,
      };
    }
    if (polygon) {
      form.values.locationBoundry = {
        type: "Polygon",
        coordinates: polygon,
      };
    }
    console.log("Form state on submit:", form.values);
    const raw_result = await newEditProject(form.values);
    const result = JSON.parse(raw_result);
    console.log("Result:", result);
    if (result.success === true) {
      router.push(`/projects/${result.data.name}`);
    }
  }
  const initialState = {
    message: null,
  };

  function SubmitButton() {
    // const { pending } = useFormStatus();
    return (
      <>
        <Button loading={loading} onClick={submitForm} color="blue">
          Submit
        </Button>
      </>
    );
  }
  // const [visible, handlers] = useDisclosure(false);

  // const [errorMsg, setErrorMsg] = useState('')

  return (
    <>
      <Box>
        <Grid>
          <Grid.Col span={4}>
            <TextInput
              label="Name"
              key="name"
              {...form.getInputProps("name")}
            />
            <Textarea
              label="Description"
              {...form.getInputProps("description")}
            />
            <Textarea label="Notes" {...form.getInputProps("notes")} />
            <TagsInput
              label="Collaborating Editors"
              placeholder="add email then click enter"
              {...form.getInputProps("authorizedUsers")}
            />
            <SubmitButton />
          </Grid.Col>
          <Grid.Col span={8}>
            <LocationMap
              onPointSelect={setPoint}
              onPolygonSelect={setPolygon}
            />
          </Grid.Col>
        </Grid>
      </Box>
    </>
  );
}

// <TextInput
//   label="Name"
//   // key={form.key("name")}
//   {...form.getInputProps("name")}
// />
// <Textarea
//   label="Description"
//   // key={form.key("description")}
//   {...form.getInputProps("description")}
// />
// <Textarea
//   label="Notes"
//   // key={form.key("notes")}
//   {...form.getInputProps("notes")}
// />
// <TagsInput
//   label="Collaborating Editors"
//   placeholder="Enter emails"
//   // key={form.key("authorizedUsers")}
//   {...form.getInputProps("authorizedUsers")}
// />
