"use client";
import React from "react";
import dynamic from "next/dynamic";

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
  Switch,
} from "@mantine/core";
import {
  IconDots,
  IconEye,
  IconFileZip,
  IconTrash,
  IconRefresh,
} from "@tabler/icons-react";
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useContext, Suspense, useState, useEffect } from "react";
import CanvasContext from "./context_mod_map";
const ModuleForm = dynamic(() => import("components/projects/mf.js"));
// const MultiModuleForm = dynamic(() => import("components/projects/mfs.js"));
import MultiModuleForm from "components/projects/mfs.js";
import RemoveModuleForm from "./mf_delete";
import { usePathname, useSearchParams } from "next/navigation";

// const [visible, handlers] = useDisclosure(false);

// const [errorMsg, setErrorMsg] = useState('')

// DONE: Make this an element that sits on the right side of page and allows for editing of module properties
// TODO: make a master toolbar
// TODO: Implement search for plants... https://nextjs.org/docs/app/building-your-application/optimizing/lazy-loading

export function sliderz() {
  const { mode, setMode } = useContext(CanvasContext);
  const [value, setValue] = useState(mode);
  return (
    <>
      <SegmentedControl
        value={mode}
        onChange={setMode}
        data={[
          { label: "Modules", value: "Modules" },
          { label: "Plants", value: "plants" },
          { label: "Edit", value: "edit" },
          { label: "Svelte", value: "svelte" },
        ]}
      />
    </>
  );
}
// switch to turn on edit mode
function EditModeSwitch() {
  const { editMode, setEditMode } = useContext(CanvasContext);
  return (
    <Switch
      checked={editMode}
      onChange={(event) => setEditMode(event.currentTarget.checked)}
      size="md"
      onLabel="EDIT"
      offLabel="BROWSE"
    />
  );
}

// export const LoadMods = () => {
//   return fetch("/your-api-endpoint")
//     .then((response) => response.json())
//     .catch((error) => console.error("Error:", error));
// };

export default function ModuleToolbar() {
  // console.log("ModuleToolbar");
  // const CanvasContext =
  //   typeof window !== "undefined"
  //     ? require("/components/projects/canvas_base").CanvasContext
  //     :
  const {
    selectedModule,
    setSelectedModule,
    mode,
    setMode,
    setSelectedCell,
    selectedCell,
    modules,
    setModules,
    clearSelectedCells,
    returnSelectedCells,
  } = useContext(CanvasContext);
  // const [selectedModule, setSelectedModule] = useState(null);
  // console.log("CanvasContext:", selectedModule);

  return (
    <>
      <Card shadow="xs" padding="lg" pl={8} radius="sm" withBorder>
        <CardSection withBorder inheritPadding py="xs">
          <Group justify="space-between">
            <Group justify="space-between">{sliderz()}</Group>
            <EditModeSwitch />
          </Group>
        </CardSection>

        {mode === "edit" && (
          <CardSection withBorder inheritPadding py="xs">
            <Group>
              <RemoveModuleForm returnSelectedCells={returnSelectedCells} />
              <Button
                // onClick={() =>
                // setSelectedModule({ ...selectedModule, x: "", y: "", _id: "" })
                // }
                onClick={clearSelectedCells}
                color="yellow"
                variant="light"
                radius="md"
              >
                Clear
              </Button>
              {/* <Button color="blue" variant="light" radius="md">
                Select Modules
              </Button> */}
            </Group>
            {/* <ActionIcon
              onClick={() => {
                LoadMods().then((data) => setModules(data));
              }}
              color="blue"
            >
              <IconRefresh />
            </ActionIcon> */}
            {selectedCell.size >= 1 && (
              <Group>
                <MultiModuleForm returnSelectedCells={returnSelectedCells} />
              </Group>
            )}
          </CardSection>
        )}
      </Card>
    </>
  );
}

export function ModuleFormModal(values, onClose) {
  console.log("props:", values);
  // const onClose = useContext(CanvasContext);
  // const [opened, { open, close }] = useDisclosure(false);

  // const form = useForm({
  // initialValues: {
  //   model: "",
  //   size: {
  //     x: 0,
  //     y: 0,
  //   },
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
