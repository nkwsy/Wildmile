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
  Box,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useRouter } from "next/navigation";

// import Router from "next/router";
import { DateTimePicker } from "@mantine/dates";
import classes from "styles/TrashItemAccordion.module.css";
// const [visible, handlers] = useDisclosure(false)

import TrashImageUpload from "components/trash/TrashImageUpload";
import { CreateLog } from "app/actions/TrashActions";
import { SubmitButton } from "components/SubmitButton";
// const [errorMsg, setErrorMsg] = useState('')

export default function TrashForm(props) {
  const [files, setFiles] = useState([]);
  const [loading, { toggle }] = useDisclosure();

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
    toggle(true);
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
      values.images = files;
      console.log(values);
      const raw_response = await CreateLog(values);
      const response = await raw_response;
      // router.push(`/trash/log/${response._id}`);
    } catch (error) {
      toggle(false);

      console.error(error);
    }
  };
  const marks = [
    { value: 1, label: "1" },
    // { value: 2, label: "2" },
    // { value: 3, label: "3" },
    // { value: 4, label: "4" },
    // { value: 5, label: "5" },
    { value: 6, label: "6" },
    // { value: 7, label: "7" },
    // { value: 8, label: "8" },
    // { value: 9, label: "9" },
    // { value: 10, label: "10" },
    // { value: 11, label: "11" },
    { value: 12, label: "12" },
  ];
  return (
    // <div>
    <>
      <Grid>
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
            <Box>
              <Text size="sm">Trashiness (1 is clean, 12 is dirty AF)</Text>
              <div span={4}>
                <Slider
                  // className={classes.slider}
                  size="lg"
                  // py={10}
                  // pb={"xl"}
                  mb="md"
                  max={12}
                  min={1}
                  step={1}
                  marks={marks}
                  {...form.getInputProps("trashiness")}
                />
              </div>
            </Box>

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
                value={new Date(form.values.timeEnd)}
                onChange={(date) =>
                  form.setFieldValue("timeEnd", date.toISOString())
                }
                {...form.getInputProps("timeEnd")}
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
          </Group>
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
          {/* <Group justify="flex-start"> */}
          <Grid>
            <Grid.Col span={6}>
              <Textarea
                label="Notes"
                description="Any fun things found? Issues or triumphs?"
                {...form.getInputProps("notes")}
              />
            </Grid.Col>
            <Grid.Col span={6}>
              <TrashImageUpload setImageFiles={setFiles} />
            </Grid.Col>
          </Grid>
          <Group>
            <Button type="submit" color="blue" loading={loading}>
              Submit
            </Button>
            {/* <SubmitButton /> */}
          </Group>
        </form>
      </Grid>
      {/* </div> */}
    </>
  );
}
