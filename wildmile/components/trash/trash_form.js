"use client";
import { useState } from "react";
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
  Text,
  Grid,
  GridCol,
  Slider,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";

// import Router from "next/router";
import { DateTimePicker } from "@mantine/dates";
import classes from "styles/TrashItemAccordion.module.css";
// const [visible, handlers] = useDisclosure(false)

import { CreateLog } from "app/actions/TrashActions";
import { SubmitButton } from "components/SubmitButton";
// const [errorMsg, setErrorMsg] = useState('')

export default function TrashForm(props) {
  const router = useRouter();

  const form = useForm({
    initialValues: {
      site: "",
      numOfParticipants: 1,
      timeStart: new Date(),
      timeEnd: new Date(),
      trashiness: 1,
      temp: 65,
      wind: 1,
      cloud: 1,
      weight: null,
      notes: "",
    },

    validate: (values) => {
      // if (active === 0) {
      return {
        site: values.site === "" ? "Must choose a site location" : null,
        timeEnd:
          values.timeEnd < values.timeStart
            ? "Time ended cannot be before time started"
            : null,
      };
      // }

      return {};
    },
  });

  const CreateTrashLogForm = async (values) => {
    // const {
    //   site,
    //   participants,
    //   timeStart,
    //   timeEnd,
    //   trashiness,
    //   temp,
    //   wind,
    //   cloud,
    //   notes,
    // } = values;
    // console.log("Form Data:", site);
    // const rawFormData = Object.fromEntries(formData);
    try {
      console.log(values);
      const raw_response = await CreateLog(values);
      const response = await raw_response.json();
      router.push(`/trashlog/${response._id}`);
    } catch (error) {
      console.error(error);
    }
  };
  const marks = [
    { value: 1, label: "1" },
    { value: 5, label: "5" },
    { value: 8, label: "8" },
    { value: 12, label: "12" },
  ];
  return (
    // <div>
    <>
      <form onSubmit={form.onSubmit((values) => CreateTrashLogForm(values))}>
        <Group>
          <Select
            label="Site"
            description="General unless your cleaning in a specific area."
            data={[
              { value: "General Wild Mile", label: "General Wild Mile" },
              { value: "Riverwalk", label: "Riverwalk" },
              { value: "Turning Basin", label: "Turning Basin" },
              { value: "North West", label: "North West" },
              { value: "North East", label: "North East" },
              { value: "South West", label: "South West" },
              { value: "South East", label: "South East" },
            ]}
            {...form.getInputProps("site")}
          />
          <NumberInput
            className={classes.numberInput}
            defaultValue={1}
            label="Participants"
            description="Number of people"
            max={20}
            min={1}
            {...form.getInputProps("numOfParticipants")}
          />
          <NumberInput
            className={classes.numberInput}
            label="Weight"
            description="Total weight in Kg"
            min={0}
            suffix="Kg"
            {...form.getInputProps("weight")}
          />
        </Group>
        <Group>
          <DateTimePicker
            label="Time Start"
            value={new Date(form.values.timeStart)}
            onChange={(date) =>
              form.setFieldValue("timeStart", date.toISOString())
            }
            {...form.getInputProps("timeStart")}
          />
          <DateTimePicker
            label="Time End"
            value={new Date(form.values.timeStart)}
            onChange={(date) =>
              form.setFieldValue("timeStart", date.toISOString())
            }
            {...form.getInputProps("timeEnd")}
          />
        </Group>
        <Text size="sm">Trashiness (1 is clean, 12 is dirty AF)</Text>
        <>
          <Slider
            size="lg"
            max={12}
            min={1}
            step={1}
            marks={marks}
            {...form.getInputProps("trashiness")}
          />
        </>
        <Group>
          <NumberInput
            className={classes.numberInput}
            defaultValue={65}
            label="Temperature"
            description="in Fahrenheit"
            max={120}
            min={0}
            {...form.getInputProps("temp")}
          />
          <Select
            // className={classes.numberInput}
            label="Wind Speed"
            description="How windy was it?"
            data={[
              { value: "0", label: "None" },
              { value: "1", label: "Barely Perceptible" },
              { value: "2", label: "Felt on face, leaves rustle" },
              { value: "3", label: "Leaves in constant motion" },
              { value: "4", label: "Branches moving, debris pushed around" },
              { value: "5", label: "Trees sway, noticeable waves" },
            ]}
            {...form.getInputProps("wind")}
          />
          <Select
            label="Cloud Cover"
            description="How cloudy was it?"
            data={[
              { value: "0", label: "Clear" },
              { value: "1", label: "Partly Cloudy" },
              { value: "2", label: "Cloudy" },
              { value: "3", label: "Fog" },
              { value: "4", label: "Light Rain" },
              { value: "5", label: "Snow" },
              { value: "6", label: "Sleet" },
              { value: "7", label: "Showers" },
            ]}
            {...form.getInputProps("cloud")}
          />
        </Group>

        <Textarea
          label="Notes"
          description="Any fun things found? Issues or triumphs?"
          {...form.getInputProps("notes")}
        />
        <Group>
          <SubmitButton />
        </Group>
      </form>
      {/* </Grid> */}
      {/* </div> */}
    </>
  );
}
