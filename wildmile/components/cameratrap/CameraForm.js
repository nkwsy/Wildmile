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
  Autocomplete,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";

import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";
import { newEditCamera, getCamera } from "/app/actions/CameratrapActions";

export default function CameraForm(props) {
  const [loading, { toggle }] = useDisclosure();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  console.log("Pathname:", pathname, params);
  // ...

  const form = useForm({
    // mode: "uncontrolled",

    initialValues: {
      name: "",
      model: "",
      manufacturer: "",
      serial: "",
      connectivity: "",
      purchaseDate: "",
    },
  });

  const [manufacturers, setManufacturers] = useState([]);
  const [modelOptions, setModelOptions] = useState([]);

  // Fetch camera options on component mount
  useEffect(() => {
    async function fetchCameraOptions() {
      try {
        const response = await fetch("/api/cameratrap/camera-options");
        if (!response.ok) throw new Error("Failed to fetch camera options");
        const data = await response.json();

        setManufacturers(data.manufacturers);
        setModelOptions(data.models);
      } catch (error) {
        console.error("Error fetching camera options:", error);
      }
    }

    fetchCameraOptions();
  }, []);

  // Filter model options based on selected manufacturer
  const getModelsByManufacturer = (manufacturer) => {
    return modelOptions
      .filter((m) => m.make === manufacturer)
      .map((m) => m.model);
  };

  useEffect(() => {
    if (params.cameraId) {
      if (params.cameraId === "new") {
        return;
      }
      const fetchData = async () => {
        const project_result = await getCamera(params.project);
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
    console.log("Form state on submit:", form.values);
    const result = await newEditCamera(form.values);
    console.log("Result:", result);
    if (result.success === true) {
      router.push(`/cameratrap/camera/${result.cameraId}`);
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
            <TextInput label="UR ID" {...form.getInputProps("name")} />
            <Autocomplete
              label="Manufacturer"
              data={manufacturers}
              {...form.getInputProps("manufacturer")}
              onChange={(value) => {
                form.setFieldValue("manufacturer", value);
                // Clear model when manufacturer changes
                form.setFieldValue("model", "");
              }}
            />
            <Autocomplete
              label="Model"
              data={
                form.values.manufacturer
                  ? getModelsByManufacturer(form.values.manufacturer)
                  : []
              }
              {...form.getInputProps("model")}
              disabled={!form.values.manufacturer}
            />
            <TextInput
              label="Serial Number"
              key="serial"
              {...form.getInputProps("serial")}
            />
            <Select
              label="Connectivity"
              data={["Cellular", "Wifi", "None"]}
              {...form.getInputProps("connectivity")}
            />
            <DatePickerInput
              label="Date Purchased"
              {...form.getInputProps("purchaseDate")}
            />
            <Textarea label="Notes" {...form.getInputProps("notes")} />
            <SubmitButton />
          </Grid.Col>
        </Grid>
      </Box>
    </>
  );
}
