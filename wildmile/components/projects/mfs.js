"use client";
import { insertModules } from "/app/actions";
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
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useParams } from "next/navigation";

import { IconTrash } from "@tabler/icons-react";
export default function MultiModuleForm(modules) {
  const params = useParams();

  const initialValues = {
    model: modules.model || "",
    locations: {
      modules,
    },
    flipped: modules.flipped || "",
    island_name: modules.island_name || "",
    locationCode: modules.locationCode || "",
    notes: modules.notes || "",
    orientation: modules.orientation || "",
    project: modules.project || "",
    projectName: params.project || "",
    sectionName: modules.sectionId || "",
    shape: modules.shape || "",
    tag: modules.tag || "",
    tags: modules.tags || [],
  };

  // const initialValues = { locations: modules };
  const form = useForm({
    initialValues,
  });
  console.log("Params:", params);
  console.log("Modules:", modules);
  function submitForm() {
    console.log("Form state on submit:", form.values);
    insertModules(form.values);
  }
  // console.log("Form state on submit:", modules, form.values);
  return (
    <>
      <Box maw={340} mx="auto">
        <form>
          <Group style={{ display: "flex", gap: "8px" }}>
            <SegmentedControl
              data={["3-d", "5-d", "Sub", "Dock"]}
              label="Model"
              {...form.getInputProps("model")}
            />
          </Group>
          <Group style={{ display: "flex", gap: "8px" }}>
            <SegmentedControl
              data={["R3", "T3", "R2.3", "T2.3"]}
              {...form.getInputProps("shape")}
            />
            <SegmentedControl
              data={["flat", "RH", "LH"]}
              {...form.getInputProps("orientation", {
                value:
                  initialValues.shape === "R3" || initialValues.shape === "R2.3"
                    ? "flat"
                    : initialValues.orientation,
              })}
            />
            <Checkbox
              mt="md"
              label="Flipped"
              {...form.getInputProps("flipped", { type: "checkbox" })}
            />
          </Group>
          <Group style={{ display: "flex", gap: "8px" }}>
            {/* <NumberInput
              label="Location X"
              disabled
              {...form.getInputProps("location.x")}
              style={{ flex: 1 }}
            />
            <NumberInput
              label="Location Y"
              disabled
              {...form.getInputProps("location.y")}
              style={{ flex: 1 }}
            /> */}
          </Group>
          <Group style={{ display: "flex", gap: "8px" }}>
            <TextInput
              label="Island Name"
              style={{ flex: 1 }}
              {...form.getInputProps("island_name")}
            />
            <TextInput
              label="Location Code"
              style={{ flex: 1 }}
              {...form.getInputProps("locationCode")}
            />
          </Group>
          <TagsInput label="Tags" {...form.getInputProps("tags")} />
          <TextInput label="Notes" {...form.getInputProps("notes")} />
          <Group justify="flex-end" mt="sm">
            <Button onClick={submitForm}>Submit</Button>
          </Group>
        </form>
      </Box>
    </>
  );
}
