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
  Grid,
  GridCol,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import classes from "styles/TrashItemAccordion.module.css";
// const [visible, handlers] = useDisclosure(false)

// const [errorMsg, setErrorMsg] = useState('')

export default function TrashForm(props) {
  return (
    // <div>
    <>
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
          {...props.form.getInputProps("site")}
        />
        <NumberInput
          className={classes.numberInput}
          defaultValue={1}
          label="Participants"
          description="Number of people"
          max={20}
          min={1}
          {...props.form.getInputProps("participants")}
        />
        <NumberInput
          className={classes.numberInput}
          label="Weight"
          description="Total weight in Lbs"
          min={0}
          suffix="lbs"
          {...props.form.getInputProps("weight")}
        />
      </Group>
      <Group>
        <DateTimePicker
          label="Time Start"
          {...props.form.getInputProps("timeStart")}
        />
        <DateTimePicker
          label="Time End"
          {...props.form.getInputProps("timeEnd")}
        />
      </Group>
      <Group>
        <NumberInput
          // className={classes.numberInput}
          description="Subjective measure of trashiness. 1 is clean, 12 is very dirty."
          defaultValue={1}
          label="Trash Level"
          max={12}
          min={1}
          {...props.form.getInputProps("trashiness")}
        />
        <NumberInput
          className={classes.numberInput}
          defaultValue={65}
          label="Temperature"
          description="in Fahrenheit"
          max={120}
          min={0}
          {...props.form.getInputProps("temp")}
        />
        <Select
          className={classes.numberInput}
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
          {...props.form.getInputProps("wind")}
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
          {...props.form.getInputProps("cloud")}
        />
      </Group>
      <Textarea
        label="Notes"
        description="Any fun things found? Issues or triumphs?"
        {...props.form.getInputProps("notes")}
      />
      {/* </Grid> */}
      {/* </div> */}
    </>
  );
}
