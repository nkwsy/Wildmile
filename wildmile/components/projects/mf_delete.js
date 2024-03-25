"use client";
import React, {
  useContext,
  Suspense,
  useState,
  useEffect,
  useFormState,
} from "react";
import { useFormStatus } from "react-dom";

import { removeModules } from "/app/actions";
import {
  TextInput,
  NumberInput,
  VisuallyHidden,
  Checkbox,
  Button,
  Group,
  Box,
  TagsInput,
  SegmentedControl,
  ActionIcon,
  Modal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";

import ClientProvider from "components/projects/context_mod_map";
import { IconTrash } from "@tabler/icons-react";

export default function RemoveModuleForm({ returnSelectedCells }) {
  const router = useRouter();

  const pathname = usePathname();
  const params = useParams();

  const { removedModules, setRemovedModules } = useContext(ClientProvider);
  console.log("Params:", params);
  const locations = [];

  const initialValues = {
    locations: locations,
    projectName: params.project,
    sectionName: params.section,
  };

  // const initialValues = { locations: modules };
  const form = useForm({
    initialValues,
  });

  async function submitForm() {
    if (form.isSubmitting) {
      return; // Prevent multiple submissions
    }

    try {
      console.log("Removing highlighted modules:", form.values);
      const modules = returnSelectedCells();
      console.log("Modules:", modules);
      modules.forEach((cell) => {
        locations.push({ x: cell.x, y: cell.y });
      });
      console.log("Locations:", locations);
      form.values.locations = locations;
      const rawResult = await removeModules(form.values);
      const result = await JSON.parse(rawResult);
      console.log("Result:", result);

      if (result.success === true) {
        console.log("success");
        setRemovedModules(result.data);

        return result;
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      // Handle the error as needed
    }
  }

  const initialState = {
    message: null,
  };

  function SubmitButton() {
    const { pending } = useFormStatus();
    const [opened, setOpened] = useState(false);

    const confirmDelete = () => {
      console.log("Delete confirmed");
      // Place your delete logic here
      submitForm();
      setOpened(false); // Close the modal after confirmation
    };

    return (
      <>
        <Button
          type="button" // Change to "button" to prevent form submission on first click
          color="red"
          loading={pending}
          variant="light"
          radius="md"
          onClick={() => setOpened(true)} // Open modal on click
        >
          <IconTrash />
        </Button>

        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          title="Confirm Delete"
        >
          <p>Are you sure you want to delete this item?</p>
          <Group position="right" mt="md">
            <Button variant="default" onClick={() => setOpened(false)}>
              Cancel
            </Button>
            <Button type="submit" color="red" onClick={confirmDelete}>
              Confirm
            </Button>
          </Group>
        </Modal>
      </>
    );
  }
  //   function SubmitButton() {
  //     const { pending } = useFormStatus();
  //     console.log("Pending:", pending);

  //     return (
  //       <Button
  //         type="submit"
  //         color="red"
  //         loading={pending}
  //         variant="light"
  //         radius="md"
  //       >
  //         <IconTrash />
  //       </Button>
  //     );
  //   }

  // const [state, formAction] = useFormState(insertModules, initialState);
  // console.log("Form state on submit:", modules, form.values);
  return (
    <>
      {/* <Box maw={340} mx="auto"> */}
      {/* <form action={formAction}> */}
      <form action={submitForm}>
        {/* <Group justify="flex-end" mt="sm"> */}
        <SubmitButton />
        {/* <Button onClick={submitForm}>Submit</Button> */}
        {/* </Group> */}
      </form>
      {/* </Box> */}
    </>
  );
}
