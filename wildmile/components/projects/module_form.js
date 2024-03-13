// import { useState } from "react";
import React from "react";

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
  Modal,
  Card,
  Image,
  Badge,
  Text,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";

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
// TODO: Make this an element that sits on the right side of page and allows for editing of module properties
// TODO: make a master toolbar
export function ModuleFormModal(values, onClose) {
  console.log("props:", values);
  // const onClose = useContext(CanvasContext);
  // const [opened, { open, close }] = useDisclosure(false);

  // const form = useForm({
  //   initialValues: {
  //     model: "",
  //     size: {
  //       x: 0,
  //       y: 0,
  //     },
  //     notes: "",
  //     dateInstalled: new Date(),
  //   },
  // });

  const handleSubmit = (values) => {
    console.log(values); // Process form values
    onClose(); // Close the form after submission
  };
  return (
    <Modal opened={true} title="Your Form Title">
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Card.Section>
          <Image
            src="https://raw.githubusercontent.com/mantinedev/mantine/master/.demo/images/bg-8.png"
            height={160}
            alt="Norway"
          />
        </Card.Section>

        <Group justify="space-between" mt="md" mb="xs">
          <Text fw={500}>{values.model}</Text>
          <Badge color="pink">On Sale</Badge>
        </Group>

        <Text size="sm" c="dimmed">
          With Fjord Tours you can explore more of the magical fjord landscapes
          with tours and activities on and around the fjords of Norway
        </Text>

        <Button color="blue" fullWidth mt="md" radius="md">
          Book classic tour now
        </Button>
      </Card>
    </Modal>
  );
}

{
  /* <form onSubmit={form.onSubmit(handleSubmit)}> */
}
{
  /* <ModuleForm form={form} /> */
}
{
  /* <Button type="submit">Submit</Button> */
}
{
  /* </form> */
}
// </Modal>
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
