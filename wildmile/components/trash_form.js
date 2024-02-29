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
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
// const [visible, handlers] = useDisclosure(false)

// const [errorMsg, setErrorMsg] = useState('')

export default function TrashForm(props) {
  return (
  <div>  
      <Select
        label="Site"
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
        defaultValue={1}
        label="Number of Participants"
        max={20}
        min={1}
        {...props.form.getInputProps("participants")}
      />
      <DateTimePicker
        suppressHydrationWarning
        dropdownType="modal"
        ValueFormat="DD MMM YYYY hh:mm A"
        label="Time Start"
        placeholder="Pick date and time"
        maw={400}
        {...props.form.getInputProps("timeStart")}
      />
      <DateTimePicker
        suppressHydrationWarning
        dropdownType="modal"
        ValueFormat="DD MMM YYYY hh:mm A"
        label="Time End"
        placeholder="Pick date and time"
        maw={400}
        {...props.form.getInputProps("timeEnd")}
      />
      // {/* This needs to be explained better, what is a 12 vs a 1 */}
      <NumberInput
        defaultValue={1}
        label="Trash Level"
        max={12}
        min={1}
        {...props.form.getInputProps("trashiness")}
      />
      <NumberInput
        defaultValue={65}
        label="Temp (F)"
        max={120}
        min={0}
        {...props.form.getInputProps("temp")}
      />
      <Select
        label="Wind Speed"
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
      <Textarea label="Notes" {...props.form.getInputProps("notes")} />
</div>
  );
}
