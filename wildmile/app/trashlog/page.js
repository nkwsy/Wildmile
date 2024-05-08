"use server";
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
} from "@mantine/core";
import { CreateLog } from "app/actions/TrashActions";

import TrashLogFrom from "components/trash/TrashLogForm";
import { SubmitButton } from "components/SubmitButton";
import TrashForm from "components/trash/trash_form";
import { useForm } from "@mantine/form";

export default async function TrashLogPage() {
  async function CreateTrashLogForm(formData) {
    "use server";
    const {
      site,
      participants,
      timeStart,
      timeEnd,
      trashiness,
      temp,
      wind,
      cloud,
      notes,
    } = formData;
    console.log("Form Data:", site);
    const rawFormData = Object.fromEntries(formData);
    console.log(rawFormData);
    const response = await CreateLog(formData);
    console.log(response);
  }

  return (
    <Container my="6rem">
      <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
        <Title mb={30} align="center">
          Create a new trash log
        </Title>
        {/* <form onSubmit={CreateTrashLogForm}> */}
        <TrashForm />
        {/* <SubmitButton /> */}
        {/* </form> */}
      </Paper>
    </Container>
  );
}
