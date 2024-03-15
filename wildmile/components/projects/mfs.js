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

import { IconTrash } from "@tabler/icons-react";
export default function MultiModuleForm({ modules }) {
  const initialValues = modules.map((module) => ({
    model: module.model || "",
    location: {
      x: module.x || "",
      y: module.y || "",
    },
    flipped: module.flipped || "",
    island_name: module.island_name || "",
    locationCode: module.locationCode || "",
    notes: module.notes || "",
    orientation: module.orientation || "",
    project: module.project || "",
    projectId: module.projectId || "",
    sectionId: module.sectionId || "",
    shape: module.shape || "",
    tag: module.tag || "",
    tags: module.tags || [],
  }));

  const form = useForm({
    initialValues,
  });

  console.log("Form state on submit:", modules, form.values);
  return (
    <>
      <Box maw={340} mx="auto">
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          {initialValues.map((initialValue, index) => (
            <div key={index}>
              <Group style={{ display: "flex", gap: "8px" }}>
                <SegmentedControl
                  data={["3-d", "5-d", "Sub", "Dock"]}
                  {...form.getInputProps(`model[${index}]`)}
                />
              </Group>
              <Group style={{ display: "flex", gap: "8px" }}>
                <SegmentedControl
                  data={["R3", "T3", "R2.3", "T2.3"]}
                  {...form.getInputProps(`shape[${index}]`)}
                />
                <SegmentedControl
                  data={["flat", "RH", "LH"]}
                  {...form.getInputProps(`orientation[${index}]`, {
                    value:
                      initialValue.shape === "R3" ||
                      initialValue.shape === "R2.3"
                        ? "flat"
                        : initialValue.orientation,
                  })}
                />
                <Checkbox
                  mt="md"
                  label="Flipped"
                  {...form.getInputProps(`flipped[${index}]`, {
                    type: "checkbox",
                  })}
                />
              </Group>
              <Group style={{ display: "flex", gap: "8px" }}>
                <NumberInput
                  label="Location X"
                  disabled
                  {...form.getInputProps(`location.x[${index}]`)}
                  style={{ flex: 1 }}
                />
                <NumberInput
                  label="Location Y"
                  disabled
                  {...form.getInputProps(`location.y[${index}]`)}
                  style={{ flex: 1 }}
                />
              </Group>
              <Group style={{ display: "flex", gap: "8px" }}>
                <TextInput
                  label="Island Name"
                  style={{ flex: 1 }}
                  {...form.getInputProps(`island_name[${index}]`)}
                />
                <TextInput
                  label="Location Code"
                  style={{ flex: 1 }}
                  {...form.getInputProps(`locationCode[${index}]`)}
                />
              </Group>
              <TagsInput
                label="Tags"
                {...form.getInputProps(`tags[${index}]`)}
              />
              <TextInput
                label="Notes"
                {...form.getInputProps(`notes[${index}]`)}
              />
            </div>
          ))}
          <Group justify="flex-end" mt="sm">
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Box>
    </>
  );
}
