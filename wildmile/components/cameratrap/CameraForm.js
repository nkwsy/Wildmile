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
            <TextInput
              label="Model"
              key="model"
              {...form.getInputProps("model")}
            />
            <Textarea
              label="Manufacturer"
              {...form.getInputProps("manufacturer")}
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
