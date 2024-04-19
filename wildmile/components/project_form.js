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
import { DateTimePicker } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { useParams, useRouter, useFetch, usePathname } from "next/navigation";
import { newEditProject } from "/app/actions";

export default function ProjectForm(props) {
  const router = useRouter();

  const pathname = usePathname();
  const params = useParams();
  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      notes: "",
    },
  });

  async function submitForm() {
    console.log("Form state on submit:", form.values);
    const result = await newEditProject(form.values);
    console.log("Result:", result);
    if (result.success === true) {
      router.push(`/projects/${result.data.name}`);
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
          <SubmitButton />
        </div>
      </Box>
    </>
  );
}
