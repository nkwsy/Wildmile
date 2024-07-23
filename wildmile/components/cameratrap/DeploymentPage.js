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
  ActionIcon,
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
import { IconEdit } from "@tabler/icons-react";

export function DateBox({ field, setDate = null }) {
  const [value, setValue] = useState(null);
  const [toggle, setToggle] = useState(true);

  useEffect(() => {
    if (setDate) {
      setValue(new Date(setDate));
    }
  }, []);

  useEffect(() => {
    if (toggle === false) {
      console.log("value of date ", value);
    }
  }, [value]);

  return (
    <>
      <Box maw={200}>
        <Group>
          <DatePickerInput
            label="Pick date"
            placeholder="Pick date"
            disabled={toggle}
            value={value}
            onChange={setValue}
          />
          <ActionIcon onClick={setToggle(false)} variant="light" color="yellow">
            <IconEdit />
          </ActionIcon>
        </Group>
      </Box>
    </>
  );
}
