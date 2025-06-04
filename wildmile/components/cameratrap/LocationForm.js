"use client";
import { Children, useState, useEffect } from "react";
import {
  Stepper,
  Stack,
  Space,
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
  Modal,
  ScrollArea,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";
// import { newEditProject, getProject } from "/app/actions";
import { newEditLocation } from "app/actions/CameratrapActions";
import MyLocationButton from "components/maps/MyLocationButton";
// import LocationModal from "./maps/LocationModal";
import LocationMap from "components/maps/LocationMap";

export default function LocationForm({ refreshLocations, setLocation }) {
  const [loading, { toggle }] = useDisclosure();
  const [point, setPoint] = useState(null);
  const [currentLocation, setCurrentLocation] = useState({
    latitude: null,
    longitude: null,
  });
  const [polygon, setPolygon] = useState(null);
  const [opened, { open, close }] = useDisclosure(false);
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  // ...

  const form = useForm({
    // mode: "uncontrolled",

    initialValues: {
      locationName: "",
      notes: "",
      tags: [],
      retired: false,
      mount: "",
      favorite: false,
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
    const raw_result = await newEditLocation(form.values);
    const result = raw_result;
    console.log("Result:", result);
    if (result.success === true) {
      refreshLocations(true);
      close();
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
  const onLocationSelect = (location) => {
    setPoint(location);
    setCurrentLocation({
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  return (
    <>
      <Modal
        opened={opened}
        onClose={close}
        title="Location"
        size="xl"
        centered
        scrollAreaComponent={ScrollArea.Autosize}
      >
        <Box>
          <Grid>
            <Grid.Col span={{ base: 12, md: 4 }} pb={2}>
              <Stack spacing="md">
                <TextInput
                  label="Name"
                  key="name"
                  {...form.getInputProps("locationName")}
                />
                <Group>
                  <Checkbox
                    label="Retired"
                    {...form.getInputProps("retired")}
                  />
                </Group>
                <Textarea label="Notes" {...form.getInputProps("notes")} />
                <TagsInput label="Tags" {...form.getInputProps("tags")} />

                <SubmitButton />
              </Stack>
              <Space h="md" />
              <MyLocationButton onLocationSelect={onLocationSelect} />
            </Grid.Col>
            <Grid.Col span={{ base: 12, md: 8 }}>
              <LocationMap
                onPointSelect={setPoint}
                //   onPolygonSelect={setPolygon}
              />
            </Grid.Col>
          </Grid>
        </Box>
      </Modal>
      <Button onClick={open}>New Location</Button>
    </>
  );
}
