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
      <TextInput label="model" {...props.form.getInputProps("model")} />
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

// import { useForm } from "react-hook-form";
// const [visible, handlers] = useDisclosure(false);

// const [errorMsg, setErrorMsg] = useState('')

// export default function ModuleForm(props) {
//   const { register, formState } = useForm();

//   return (
//     <>
//       <TextInput
//         label="Name"
//         {...props.form.getInputProps("name", { register })}
//       />
//       <Textarea
//         label="Description"
//         {...props.form.getInputProps("description", { register })}
//       />
//       <Textarea
//         label="Notes"
//         {...props.form.getInputProps("notes", { register })}
//       />
//       <DateTimePicker
//         label="Date Installed"
//         {...props.form.getInputProps("dateInstalled", { register })}
//       />
//       <Group>
//         <NumberInput
//           label="Size X"
//           {...props.form.getInputProps("size.x", { register })}
//         />
//         <NumberInput
//           label="Size Y"
//           {...props.form.getInputProps("size.y", { register })}
//         />
//       </Group>
