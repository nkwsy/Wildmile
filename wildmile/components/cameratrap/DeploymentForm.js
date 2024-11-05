"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";

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
  TextInput,
  MultiSelect,
  Autocomplete,
  Flex,
  Grid,
  Box,
  Fieldset,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DatePickerInput, DateInput } from "@mantine/dates";
// import MapPicker from "components/map_picker";
// import LocationModal from "components/maps/LocationModal";
// import LocationMap from "components/maps/LocationMap";
import LocationForm from "components/cameratrap/LocationForm";
import { onChangeDate } from "lib/utils";
import { LocationDropdown } from "components/maps/LocationSelect";
import {
  getExistingLocations,
  getAllCameras,
  newEditDeployment,
  getDeployment,
} from "app/actions/CameratrapActions";

import { DateBox } from "./DeploymentPage";
export function DeploymentFormOptions() {
  const form = useForm({
    initialValues: {
      cameraId: "",
      locationId: "",
      // location: {
      //   type: "Point",
      //   coordinates: [0, 0],
      // },
      coordinateUncertainty: null,
      deploymentStart: new Date(),
      // deploymentStart: null,
      deploymentEnd: null,
      setupBy: "",
      cameraDelay: null,
      cameraHeight: null,
      cameraDepth: null,
      cameraTilt: null,
      cameraHeading: null,
      detectionDistance: null,
      timestampIssues: false,
      baitUse: false,
      featureType: "",
      habitat: "",
      deploymentGroups: "",
      deploymentTags: [],
      deploymentComments: "",
    },
  });

  return form;
}
export default function DeploymentForm(props) {
  const router = useRouter();
  const params = useParams();

  const [bugData, setBugData] = useState([]);
  const [locationModalOpened, setLocationModalOpened] = useState(false);
  const [existingLocations, setExistingLocations] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [location, setLocation] = useState(null);
  const [point, setPoint] = useState(null);
  const [polygon, setPolygon] = useState(null);
  const [refreshLocations, setRefreshLocations] = useState(false);
  const [existingCameras, setExistingCameras] = useState([]);
  const [cameraOptions, setCameraOptions] = useState([]);
  const [loading, { toggle }] = useDisclosure();
  const [deploymentStart, setDeploymentStart] = useState(new Date());
  const [deploymentEnd, setDeploymentEnd] = useState(null);
  const [disabled, setDisabled] = useState(true);

  const [CurrDate, SetCurrDate] = useState(null);
  const form = DeploymentFormOptions();
  // props.existingLocations.map((location) => ({
  //   value: location.id,
  //   label: location.name,
  // }))

  // Load existing info
  useEffect(() => {
    if (!params.deploymentId) {
      setDisabled(false);
      return;
    }
    if (params.deploymentId) {
      const fetchData = async () => {
        const project_result = await getDeployment(params.deploymentId);
        const result = JSON.parse(project_result);
        // if (result && result.data) {
        console.log("Data loaded:", result);
        form.setValues({
          ...form.values, // Default values for the form
          ...result, // Data fetched from the server
        });
        if (result.deploymentStart) {
          setDeploymentStart(new Date(result.deploymentStart));
        }
        if (result.deploymentEnd) {
          setDeploymentEnd(new Date(result.deploymentEnd));
        }

        if (result.locationId) {
          // setLocation(result.locationId);
          handleLocationSelect(result.locationId);
        }

        // form.initialize(result);
        // } else {
        //   console.error("Failed to fetch data or data is empty:", result);
        // }
      };

      fetchData();
    }
  }, [params]); // Ensure to depend on params.project

  useEffect(() => {
    const fetchData = async () => {
      const res = await getExistingLocations();
      const allLocations = JSON.parse(res);
      console.log("All Locations:", allLocations);
      setExistingLocations(allLocations);
      setLocationOptions(
        allLocations.map((location) => ({
          value: location._id,
          label: location.locationName,
        }))
      );
    };
    fetchData();
    console.log("Existing Locations:", existingLocations);
  }, [refreshLocations]);

  useEffect(() => {
    console.log("Existing Locations:", existingLocations);
  }, [existingLocations]);

  // set locations
  useEffect(() => {
    const fetchCameras = async () => {
      const res = await getAllCameras();
      const allCameras = JSON.parse(res);
      console.log("All Cameras:", allCameras);
      setExistingCameras(allCameras);
      setCameraOptions(
        allCameras.map((camera) => ({
          value: camera._id,
          label:
            camera.name + " - " + camera.model + " - " + camera.manufacturer,
        }))
      );
    };
    fetchCameras();
  }, []);

  // const existingLocationOptions = [];
  const handleBugDataChange = (index, field, value) => {
    const updatedBugData = [...bugData];
    updatedBugData[index][field] = value;
    setBugData(updatedBugData);
  };

  const handleAddBugData = () => {
    setBugData([...bugData, { type: "", count: 0 }]);
  };

  const handleRemoveBugData = (index) => {
    const updatedBugData = [...bugData];
    updatedBugData.splice(index, 1);
    setBugData(updatedBugData);
  };

  const handleLocationSelect = (value) => {
    // console.log("Selected Location:", value);
    const selectedLocation = existingLocations.find((loc) => loc._id === value);
    console.log("Selected Location:", selectedLocation);
    setLocation(selectedLocation);
    // setSelectedLocation(selectedLocation);
    form.setFieldValue("location", selectedLocation._id);
    // props.form.setFieldValue("coordinates", selectedLocation.coordinates);
  };

  async function submitForm() {
    // loading(true);
    toggle();
    console.log("Location:", location);
    if (location) {
      form.values.location = location.location;
      form.values.locationId = location._id;
    }

    console.log("Form state on submit:", form.values);
    const raw_result = await newEditDeployment(form.values);
    const result = raw_result;
    console.log("Result:", result);
    if (result.success === true) {
      router.push(`/cameratrap/deployment`);
    }
  }
  return (
    <>
      <Box>
        {/* <DateBox field="deploymentStart" setDate={CurrDate} /> */}
        <Grid>
          <Grid.Col span={6}>
            <Group grow>
              <Select
                label="Camera"
                data={cameraOptions}
                {...form.getInputProps("cameraId")}
              />
              <DateInput
                label="Deployment Start"
                // onChange={(date) => this.onChangeDate(date)}
                disabled={disabled}
                value={deploymentStart}
                onChange={setDeploymentStart}
                required
                // {...form.getInputProps("deploymentStart")}
              />
              {/* <DateInput
                label="Deployment End"
                // {...form.getInputProps("deploymentEnd")}
              /> */}
            </Group>
            <Group>
              <Textarea
                miw="80%"
                label="Notes"
                {...form.getInputProps("deploymentComments")}
              />
            </Group>
            <Group py="lg">
              <Textarea
                label="Deployment Tags"
                {...form.getInputProps("deploymentTags")}
              />
            </Group>
          </Grid.Col>
          <Grid.Col span={6}>
            {/* <LocationForm
              setLocation={setLocation}
              refreshLocations={setRefreshLocations}
            /> */}
            <Select
              label="Select Location"
              data={locationOptions}
              // onChange={handleLocationSelect}
              value={location}
              onChange={(option) => {
                handleLocationSelect(option);
              }}
              {...form.getInputProps("locationId")}
            />
            <LocationDropdown
              locations={existingLocations}
              selectedLocation={location}
              setSelectedLocation={setLocation}
            />
          </Grid.Col>
        </Grid>
        <Button color="blue" onClick={submitForm} loading={loading}>
          Submit
        </Button>
      </Box>
    </>
  );
}

// {/* <form onSubmit={form.onSubmit((values) => console.log(values))}>
//   {/* <TextInput label="Location ID" {...form.getInputProps('locationID')} />
//       <TextInput label="Location Name" {...form.getInputProps('locationName')} />
//       <NumberInput label="Latitude" {...form.getInputProps('location.coordinates.1')} min={-90} max={90} />
//       <NumberInput label="Longitude" {...form.getInputProps('location.coordinates.0')} min={-180} max={180} /> */}
//   <NumberInput
//     label="Coordinate Uncertainty"
//     {...form.getInputProps("coordinateUncertainty")}
//     min={1}
//   />

//   <TextInput label="Setup By" {...form.getInputProps("setupBy")} />
//   <NumberInput
//     label="Camera Delay"
//     {...form.getInputProps("cameraDelay")}
//     min={0}
//   />
//   <NumberInput
//     label="Camera Height"
//     {...form.getInputProps("cameraHeight")}
//     min={0}
//   />
//   <NumberInput
//     label="Camera Depth"
//     {...form.getInputProps("cameraDepth")}
//     min={0}
//   />
//   <NumberInput
//     label="Camera Tilt"
//     {...form.getInputProps("cameraTilt")}
//     min={-90}
//     max={90}
//   />
//   <NumberInput
//     label="Camera Heading"
//     {...form.getInputProps("cameraHeading")}
//     min={0}
//     max={360}
//   />
//   <NumberInput
//     label="Detection Distance"
//     {...form.getInputProps("detectionDistance")}
//     min={0}
//   />
//   <Switch
//     label="Timestamp Issues"
//     {...form.getInputProps("timestampIssues", { type: "checkbox" })}
//   />
//   <Switch
//     label="Bait Use"
//     {...form.getInputProps("baitUse", { type: "checkbox" })}
//   />
//   <TextInput label="Feature Type" {...form.getInputProps("featureType")} />
//   <TextInput label="Habitat" {...form.getInputProps("habitat")} />
//   <TextInput
//     label="Deployment Groups"
//     {...form.getInputProps("deploymentGroups")}
//   />

//   <Button type="submit">Submit</Button>
// </form>; */}
