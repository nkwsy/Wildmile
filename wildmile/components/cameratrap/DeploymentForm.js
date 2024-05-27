'use client'
import { useEffect, useState } from "react";
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
import { DatePickerInput } from "@mantine/dates";
// import MapPicker from "components/map_picker";
// import LocationModal from "components/maps/LocationModal";
// import LocationMap from "components/maps/LocationMap";
import LocationForm from "components/maps/LocationForm";
import { LocationDropdown } from "components/maps/LocationSelect";
import { getExistingLocations } from "app/actions/CameratrapActions";

export default function DeploymentForm(props) {
  const [bugData, setBugData] = useState([]);
  const [locationModalOpened, setLocationModalOpened] = useState(false);
  const [existingLocations, setExistingLocations] = useState([]);
  const [locationOptions, setLocationOptions] = useState([]);
  const [location, setLocation] = useState(null);
  const [point, setPoint] = useState(null);
  const [polygon, setPolygon] = useState(null);
  // props.existingLocations.map((location) => ({
  //   value: location.id,
  //   label: location.name,
  // }))

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
  }, []);

  useEffect(() => {
    console.log("Existing Locations:", existingLocations);
  }, [existingLocations]);
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
    props.form.setFieldValue("location", selectedLocation._id);
    // props.form.setFieldValue("coordinates", selectedLocation.coordinates);
  };

  return (
<>
    <Box>
      <Grid>
        <Grid.Col span={6}>
          <Group grow>
            <NumberInput
              label="Box Number"
              {...props.form.getInputProps("boxNum")}
            />
            <NumberInput
              label="Sampling Period"
              {...props.form.getInputProps("samplingPeriod")}
              required
            />

            <DatePickerInput
              label="Date Deployed"
              defaultLevel="year"
              {...props.form.getInputProps("dateDeployed")}
            />

            <DatePickerInput
              defaultLevel="year"
              label="Date Collected"
              {...props.form.getInputProps("dateCollected")}
            />
          </Group>
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
                { value: "Benthic", label: "Benthic" },
                { value: "Surface", label: "Surface" },
              ]}
              {...props.form.getInputProps("treatment")}
            />
          </Group>
          <Group grow>
            <NumberInput
              label="Replicate Number"
              {...props.form.getInputProps("replicateNumber")}
            />
            <NumberInput
              label="Depth (in ft)"
              {...props.form.getInputProps("depth")}
            />
            {/* <TextInput
              label="Substrate"
              {...props.form.getInputProps("substrate")}
            /> */}
            {/* <TextInput label="Canopy" {...props.form.getInputProps("canopy")} /> */}
          </Group>
          <Group>
            <Textarea
              miw="80%"
              label="Notes"
              {...props.form.getInputProps("notes")}
            />
          </Group>
          <Group py="lg">
            <Fieldset>
              {bugData.map((bug, index) => (
                <div
                  key={index}
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <Autocomplete
                    label="Bug Type"
                    data={[
                      { value: "amphipoda", label: "amphipoda" },
                      { value: "chironomidae", label: "chironomidae" },
                      { value: "isopoda", label: "isopoda" },
                      { value: "odonata", label: "odonata" },
                      { value: "gastropoda", label: "gastropoda" },
                      { value: "mollusca", label: "mollusca" },
                      { value: "oligochaeta", label: "oligochaeta" },
                      { value: "planaria", label: "planaria" },
                      { value: "decapoda", label: "decapoda" },
                      { value: "diptera", label: "diptera" },
                      { value: "trichoptera", label: "trichoptera" },
                      { value: "ephemeroptera", label: "ephemeroptera" },
                      { value: "coleoptera", label: "coleoptera" },
                      { value: "nematoda", label: "nematoda" },
                      { value: "chironomidaeBW", label: "chironomidaeBW" },
                    ]}
                    value={bug.type}
                    onChange={(value) =>
                      handleBugDataChange(index, "type", value)
                    }
                  />
                  <NumberInput
                    label="Bug Count"
                    value={bug.count}
                    onChange={(value) =>
                      handleBugDataChange(index, "count", value)
                    }
                  />
                  <Button
                    variant="outline"
                    color="red"
                    onClick={() => handleRemoveBugData(index)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button variant="outline" onClick={handleAddBugData}>
                Add Bug Data
              </Button>
            </Fieldset>
          </Group>
        </Grid.Col>
        <Grid.Col span={6}>
          
            <LocationForm setLocation={setLocation} />
          <Select
            label="Select Location"
            data={locationOptions}
            // onChange={handleLocationSelect}
            // value={selectedLocation}
            onChange={(option) => {
              handleLocationSelect(option);
            }}
          />
          <LocationDropdown
            locations={existingLocations}
            selectedLocation={location}
          />
        </Grid.Col>
      </Grid>
    </Box>
    </>
  );
}