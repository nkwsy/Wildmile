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
// import { use } from "passport";

// export async function getProps(logId) {
//   //   await dbConnect();
//   // const logId = context.params.id
//   const id = logId; // Get the id from the request parameters
//   console.log("id" + id);
//   /* find all the data in our database */
//   const result = await TrashItem.find({ deleted: false }, [
//     "-creator",
//     "-__v",
//     "-createdAt",
//     "-updatedAt",
//     "-deleted",
//   ])
//     .populate({
//       path: "individualTrashItem",
//       // match: { logId: mongoose.Types.ObjectId(id) },
//       match: { logId: id },
//       model: "IndividualTrashItem",
//       select: "-__v -createdAt -updatedAt -deleted -creator",
//     })
//     .lean();

//   const items = result.reduce((acc, doc) => {
//     const item = doc; //.toObject()
//     item._id = item._id.toString();

//     // If an IndividualTrashItem was found, add its quantity to the item
//     if (!item.individualTrashItem) {
//       item.quantity = 0;
//       console.log("no individualTrashItem");
//     } else {
//       // item.individualTrashItem._id = item.individualTrashItem._id.toString();
//       item.individualTrashItem._id = item.individualTrashItem._id.toString();
//       item.individualTrashItem.itemId =
//         item.individualTrashItem.itemId.toString();
//       item.individualTrashItem.logId =
//         item.individualTrashItem.logId.toString();
//       item.quantity = item.individualTrashItem.quantity;
//       // item.weight = item.individualTrashItem.weight; // Add this line if you also want to include weight
//     }
//     // else {
//     //   item.quantity = 0; // Default quantity
//     //   // item.weight = 0; // Default weight
//     // }

//     // Remove the individualTrashItem property from the item
//     delete item.individualTrashItem;
//     // Use the _id of the item as the key
//     acc[item._id] = item;
//     return acc;
//   }, {});

//   console.log(items);
//   return { items: items, logId: id };
// }

export async function renderAccordian(logId) {
  revalidatePath("/trashlog/[Id]");
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
