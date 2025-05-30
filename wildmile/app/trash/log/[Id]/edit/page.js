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
// import { DateTimePicker } from "@mantine/dates";
// import TrashItemTable from '../../components/trash_item_table'
import TrashItemAccordian from "components/trash_item_accordian";
import { Suspense } from "react";
import { getItemsFromLog, getTrashLogById } from "app/actions/TrashActions";
import { revalidatePath } from "next/cache";
import TrashForm from "components/trash/trash_form";

import Link from "next/link";

export async function renderAccordian(logId) {
  const props = await getItemsFromLog(logId);
  // console.log("Props:", props);
  return <TrashItemAccordian props={props} />;
}

export async function renderTrashForm(logId) {
  const props = await getTrashLogById(logId);
  console.log("Props:", props);
  return <TrashForm props={props} />;
}

export default async function page(props0) {
  const params = await props0.params;
  console.log("Params:", params);

  const props = await getTrashLogById(params.Id);
  return (
    <>
      <Container>
        <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
          <Title mb={30} align="center">
            Edit Trash log
          </Title>
          <TrashForm props={props} />
          {/* <Suspense>{renderTrashForm(params.Id)}</Suspense> */}
        </Paper>
      </Container>
    </>
  );
}
