"use client";
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
  CardSection,
  Menu,
  ActionIcon,
  rem,
  MenuItem,
  MenuTarget,
  MenuDropdown,
  SegmentedControl,
} from "@mantine/core";
import { IconDots, IconEye, IconFileZip, IconTrash } from "@tabler/icons-react";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useContext, Suspense, useState, useEffect } from "react";
import CanvasContext from "./context_mod_map";
// const [visible, handlers] = useDisclosure(false);

// const [errorMsg, setErrorMsg] = useState('')

// export default function ModuleForm(props) {
//   return (
//     <>
//       {/* <TextInput label="model" {...props.form.getInputProps("model")} />
//       <Textarea label="Notes" {...props.form.getInputProps("notes")} />
//       <DateTimePicker
//         label="Date Installed"
//         {...props.form.getInputProps("dateInstalled")}
//       />
//       <Group>
//         <NumberInput label="Size X" {...props.form.getInputProps("size.x")} />
//         <NumberInput label="Size Y" {...props.form.getInputProps("size.y")} />
//       </Group> */}
//     </>
//   );
// }
// TODO: Make this an element that sits on the right side of page and allows for editing of module properties
// TODO: make a master toolbar

export function sliderz() {
  const [value, setValue] = useState("react");
  return (
    <>
      <SegmentedControl
        value={value}
        onChange={setValue}
        data={[
          { label: "React", value: "react" },
          { label: "Angular", value: "ng" },
          { label: "Vue", value: "vue" },
          { label: "Svelte", value: "svelte" },
        ]}
      />
    </>
  );
}

export default function ModuleToolbar() {
  // console.log("ModuleToolbar");
  // const CanvasContext =
  //   typeof window !== "undefined"
  //     ? require("/components/projects/canvas_base").CanvasContext
  //     :
  const { selectedModule } = useContext(CanvasContext);
  // const [selectedModule, setSelectedModule] = useState(null);
  // useEffect(() => {
  //   if (CanvasContext) {
  //     setSelectedModule(CanvasContext.selectedModule);
  //   }
  // }, [CanvasContext]);
  console.log("CanvasContext:", selectedModule);

  return (
    <>
      <Card shadow="xs" padding="lg" pl={8} radius="sm" withBorder>
        <CardSection withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Text fw={500}>Module Toolbar {selectedModule.locationCode}</Text>{" "}
          </Group>
        </CardSection>
        <CardSection withBorder inheritPadding py="xs">
          <Group justify="space-between">{sliderz()}</Group>
        </CardSection>

        <Group>
          <Button color="blue" variant="light" radius="md">
            Add Module
          </Button>
          <Button color="red" variant="light" radius="md">
            Remove Module
          </Button>
        </Group>
      </Card>
    </>
  );
}

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
