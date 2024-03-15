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
export default function Demo({ props }) {
  const initialValues = {
    model: props.model || "",
    location: {
      x: props.x || "",
      y: props.y || "",
    },
    flipped: props.flipped || "",
    island_name: props.island_name || "",
    locationCode: props.locationCode || "",
    notes: props.notes || "",
    orientation: props.orientation || "",
    project: props.project || "",
    projectId: props.projectId || "",
    sectionId: props.sectionId || "",
    shape: props.shape || "",
    tag: props.tag || "",
    tags: props.tags || [],
  };

  const form = useForm({
    initialValues,
    // validate: {
    //   email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    // },
  });

  console.log("Form state on submit:", props, form.values.model);
  return (
    <>
      <Box maw={340} mx="auto">
        <form onSubmit={form.onSubmit((values) => console.log(values))}>
          <Group style={{ display: "flex", gap: "8px" }}>
            <SegmentedControl
              data={["3-d", "5-d", "Sub", "Dock"]}
              {...form.getInputProps("model")}
            />
          </Group>
          <Group style={{ display: "flex", gap: "8px" }}>
            <SegmentedControl data={["R3", "T3", "R2.3", "T2.3"]} />
            <SegmentedControl
              data={["flat", "RH", "LH"]}
              {...form.getInputProps("orientation", {
                value:
                  initialValues.model === "R3" || initialValues.model === "R2.3"
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
            <NumberInput
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
            />
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
            <Button type="submit">Submit</Button>
          </Group>
        </form>
      </Box>
    </>
  );
}
