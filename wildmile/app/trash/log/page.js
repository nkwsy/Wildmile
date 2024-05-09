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
import TrashForm from "components/trash/trash_form";
import { getSession } from "lib/getSession";
import { redirect } from "next/navigation";
import { AlertLogin } from "components/alert";
import { cookies, headers } from "next/headers";
export default async function TrashLogPage() {
  const cookieStore = cookies();
  const token = cookieStore.get("session");
  // if (!session) {
  //   alert("You must be logged in to create a trash log");
  //   redirect("/login");
  // }
  return (
    <Container>
      <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
        <Title mb={30} align="center">
          Create a new trash log
        </Title>
        {!token && <AlertLogin />}
        {token && <TrashForm />}
      </Paper>
    </Container>
  );
}
