// import { useState } from "react";
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
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
// const [visible, handlers] = useDisclosure(false);

// const [errorMsg, setErrorMsg] = useState('')

export default function ModuleForm(props) {
  return (
    <>
      <TextInput label="Name" {...props.form.getInputProps("name")} />
      <Textarea
        label="Description"
        {...props.form.getInputProps("description")}
      />
      <Textarea label="Notes" {...props.form.getInputProps("notes")} />
      <DateTimePicker
        label="Date Installed"
        {...props.form.getInputProps("dateInstalled")}
      />
      <Group>
        <NumberInput label="Size X" {...props.form.getInputProps("size.x")} />
        <NumberInput label="Size Y" {...props.form.getInputProps("size.y")} />
      </Group>
    </>
  );
}
