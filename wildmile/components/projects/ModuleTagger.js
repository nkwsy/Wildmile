"use client";
import React, {
  useContext,
  Suspense,
  useState,
  useEffect,
  useFormState,
  useRef,
} from "react";
import { useFormStatus } from "react-dom";

import { insertModules } from "/app/actions";
import {
  TextInput,
  NumberInput,
  Checkbox,
  Button,
  Group,
  Box,
  TagsInput,
  SegmentedControl,
  ActionIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";

import ClientProvider from "components/projects/context_mod_map";

import { Stage, Layer, Rect } from "react-konva";

export default function ModuleTagger({ returnSelectedCells }) {
  const router = useRouter();

  const pathname = usePathname();
  const params = useParams();
  const modExampleRef = useState(null);
  const { newModules, setNewModules } = useContext(ClientProvider);
  console.log("Params:", params);
  const locations = [];

  const initialValues = {
    locations: locations,
    projectName: params.project,
    sectionName: params.section,
    tags: [],
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
      console.log("Form state on submit:", form.values);
      const modules = returnSelectedCells();
      console.log("Modules:", modules);
      modules.forEach((cell) => {
        locations.push({ x: cell.x, y: cell.y });
      });
      console.log("Locations:", locations);
      form.values.locations = locations;
      const rawResult = await insertModules(form.values);
      const result = await JSON.parse(rawResult);
      console.log("Result:", result);

      if (result.success === true) {
        console.log("success");

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
    console.log("Pending:", pending);

    return (
      <Button type="submit" loading={pending} color="blue">
        Submit
      </Button>
    );
  }

  // const [state, formAction] = useFormState(insertModules, initialState);
  // console.log("Form state on submit:", modules, form.values);
  return (
    <>
      <Box maw={340} mx="auto">
        {/* <form action={formAction}> */}
        <Stage width={160} height={160}>
          <Layer>
            <div ref={modExampleRef} />
          </Layer>
        </Stage>

        <form action={submitForm}>
          <TagsInput
            label="Tags"
            placeholder="enter tag"
            {...form.getInputProps("tags")}
          />
          <TextInput label="Notes" {...form.getInputProps("notes")} />

          <Group justify="flex-end" mt="sm">
            <SubmitButton />
            {/* <Button onClick={submitForm}>Submit</Button> */}
          </Group>
        </form>
      </Box>
    </>
  );
}
