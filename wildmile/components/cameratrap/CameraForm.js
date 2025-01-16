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
    async function fetchCameraData() {
      if (!params.cameraId || params.cameraId === "new") {
        return;
      }

      try {
        const cameraData = await getCamera(params.cameraId);
        const result = JSON.parse(cameraData);
        console.log("Camera data loaded:", result);

        form.setValues({
          name: result.name || "",
          model: result.model || "",
          manufacturer: result.manufacturer || "",
          serial: result.serial || "",
          connectivity: result.connectivity || "",
          purchaseDate: result.purchaseDate
            ? new Date(result.purchaseDate)
            : null,
          notes: result.notes || "",
        });
      } catch (error) {
        console.error("Error fetching camera data:", error);
      }
    }

    fetchCameraData();
  }, [params.cameraId]); // Only depend on cameraId

  async function submitForm() {
    toggle(); // Start loading
    try {
      // Check if name is unique (only for new cameras)
      if (!params.cameraId || params.cameraId === "new") {
        const checkResponse = await fetch(
          `/api/cameratrap/check-name?name=${encodeURIComponent(
            form.values.name
          )}`
        );
        const { exists } = await checkResponse.json();

        if (exists) {
          form.setFieldError("name", "A camera with this name already exists");
          toggle(); // Stop loading
          return;
        }
      }

      // Prepare the submission data
      const submissionData = {
        ...form.values,
        _id: params.cameraId !== "new" ? params.cameraId : undefined,
      };

      // Submit the data
      const response = await fetch("/api/cameratrap/camera", {
        method: params.cameraId !== "new" ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to save camera");
      }

      const result = await response.json();
      router.push("/cameratrap");
    } catch (error) {
      console.error("Error saving camera:", error);
      // You might want to show an error message to the user here
    } finally {
      toggle(); // Stop loading
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
