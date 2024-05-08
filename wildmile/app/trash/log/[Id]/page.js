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
// import IndividualTrashItem from "models/IndividualTrashItem";
// import TrashItem from "models/TrashItem";
// import dbConnect from "/lib/db/setup";
import { Suspense } from "react";
import { getItemsFromLog } from "app/actions/TrashActions";
import { revalidatePath } from "next/cache";

import Link from "next/link";

export async function renderAccordian(logId) {
  const props = await getItemsFromLog(logId);
  console.log("Props:", props);
  return <TrashItemAccordian props={props} />;
}
export default async function page({ params }) {
  console.log("Params:", params);
  // console.log(props);
  return (
    <>
      <Container>
        <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
          <Title mb={30} align="center">
            Create a new trash log
          </Title>
          <Suspense>{renderAccordian(params.Id)}</Suspense>

          {/* <TrashItemAccordian items={props.items} form={form}/> */}

          {/* <Group justify="right" mt="xl">
            {errorMsg && <p className="error">{errorMsg}</p>}
            <Button onClick={createLog}>Submit</Button>
          </Group> */}
          <Button component={Link} href="/trash">
            Done
          </Button>
        </Paper>
      </Container>
    </>
  );
}
