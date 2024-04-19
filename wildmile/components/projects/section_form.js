"use client";
import { Children, useState } from "react";
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
  Box,
} from "@mantine/core";
import { DateInput, DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";
import { newEditSection } from "/app/actions";

export default function SectionForm(props) {
  const router = useRouter();

  const pathname = usePathname();
  const params = useParams();
  console.log("Params:", params);
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      dateInstalled: "",
      notes: "",
      size: { width: 0, length: 0 },
      project_name: params.project,
    },
  });

  async function submitForm() {
    console.log("Form state on submit:", form.values);
    const result = await newEditSection(form.values);
    console.log("Result:", result);
    if (result.success === true) {
      router.push(`/projects/${params.project}`);
    }
  }
  const initialState = {
    message: null,
  };

  function SubmitButton() {
    // const { pending } = useFormStatus();

    return (
      <Button onClick={submitForm} color="blue">
        Submit
      </Button>
    );
  }
  // const [visible, handlers] = useDisclosure(false);

  // const [errorMsg, setErrorMsg] = useState('')

  return (
    <>
      <Box maw={340} mx="auto">
        <div>
          <TextInput label="Name" {...form.getInputProps("name")} />
          <Textarea
            label="Description"
            {...form.getInputProps("description")}
          />
          <Textarea label="Notes" {...form.getInputProps("notes")} />
          <DateInput
            label="Date Installed"
            {...form.getInputProps("dateInstalled")}
          />
          <NumberInput label="Width" {...form.getInputProps("size.width")} />
          <NumberInput label="length" {...form.getInputProps("size.length")} />

          <SubmitButton />
        </div>
      </Box>
    </>
  );
}
