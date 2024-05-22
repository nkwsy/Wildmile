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
  MultiSelect,
  TagsInput,
  TextInput,
  Box,
  Grid,
  Checkbox,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";
// import { newEditProject, getProject } from "/app/actions";
import { newEditLocation } from "app/actions/MacroActions";
// import LocationModal from "./maps/LocationModal";
import LocationMap from "components/maps/LocationMap";
import { get } from "mongoose";

export default function LocationForm(props) {
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
      locationName: "",
      notes: "",
      dateStart: null,
      treatment: [],
      canopy: false,
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

  //   useEffect(() => {
  //     if (params.project) {
  //       const fetchData = async () => {
  //         const project_result = await getProject(params.project);
  //         const result = JSON.parse(project_result);
  //         // if (result && result.data) {
  //         console.log("Data loaded:", result);
  //         form.initialize(result);
  //         form.setValues({
  //           // ...form.values, // Default values for the form
  //           ...result, // Data fetched from the server
  //         });
  //         // } else {
  //         //   console.error("Failed to fetch data or data is empty:", result);
  //         // }
  //       };

  //       fetchData();
  //     }
  //   }, [params]); // Ensure to depend on params.project

  async function submitForm() {
    // loading(true);
    toggle();
    if (point) {
      form.values.coordinates = {
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
    const raw_result = await newEditLocation(form.values);
    const result = raw_result;
    console.log("Result:", result);
    if (result.success === true) {
      router.push(`/burp`);
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
              {...form.getInputProps("locationName")}
            />
            <DatePickerInput
              label="Date Start"
              defaultLevel="year"
              {...form.getInputProps("dateStart")}
            />
            <Group>
              <MultiSelect
                label="Treatment"
                miw={200}
                data={[
                  {
                    value: "Artificial Structure",
                    label: "Artificial Structure",
                  },
                  { value: "Sea Wall", label: "Sea Wall" },
                  { value: "Bank", label: "Bank" },
                ]}
                {...form.getInputProps("treatment")}
              />
              <Checkbox
                label="Canopy Present"
                {...form.getInputProps("canopy")}
              />
            </Group>
            <Textarea label="Notes" {...form.getInputProps("notes")} />
            <SubmitButton />
          </Grid.Col>
          <Grid.Col span={8}>
            <LocationMap
              onPointSelect={setPoint}
              //   onPolygonSelect={setPolygon}
            />
          </Grid.Col>
        </Grid>
      </Box>
    </>
  );
}
