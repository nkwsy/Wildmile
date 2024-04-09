import { useState } from "react";
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
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { DateTimePicker } from "@mantine/dates";
import Router from "next/router";
// import TrashItemTable from '../../components/trash_item_table'
import TrashItemAccordian from "/components/trash_item_accordian";
import IndividualTrashItem from "models/IndividualTrashItem";
import TrashItem from "/models/TrashItem";
import dbConnect from "/lib/db/setup";

export default function UpdateTrashCountLog(props) {
  const [errorMsg, setErrorMsg] = useState("");
  const [active, setActive] = useState(0);
  const [visible, handlers] = useDisclosure(false);

  const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  console.log(props.logId);
  console.log(props.items);
  const form = useForm({
    initialValues: {
      logId: props.logId,
      items: props.items,
    },
  });
  console.log("Initial form state:", form);

  // console.log(props.items)
  async function createLog() {
    console.log("Form state on submit:", form);
    handlers.open();
    const res = await fetch("/api/trash/logItems", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.values),
    });

    if (res.status === 201) {
      Router.push("/trash");
    } else {
      handlers.close();
      setErrorMsg(await res.text());
    }
  }

  return (
    <>
      <Container visibleFrom="md" maw="95%" my="6rem">
        <LoadingOverlay visible={visible} overlayBlur={2} />
        <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
          <Title mb={30} align="center">
            Create a new trash log
          </Title>
          <TrashItemAccordian items={props.items} form={form} />
          {/* <TrashItemAccordian items={props.items} form={form}/> */}

          <Group justify="right" mt="xl">
            {errorMsg && <p className="error">{errorMsg}</p>}
            <Button onClick={createLog}>Submit</Button>
          </Group>
        </Paper>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  await dbConnect();
  // const logId = context.params.id
  const id = context.params.id; // Get the id from the request parameters
  console.log("id" + id);
  /* find all the data in our database */
  const result = await TrashItem.find({ deleted: false }, [
    "-creator",
    "-__v",
    "-createdAt",
    "-updatedAt",
    "-deleted",
  ])
    .populate({
      path: "individualTrashItem",
      // match: { logId: mongoose.Types.ObjectId(id) },
      match: { logId: id },
      model: "IndividualTrashItem",
      select: "-__v -createdAt -updatedAt -deleted -creator",
    })
    .lean();

  const items = result.reduce((acc, doc) => {
    const item = doc; //.toObject()
    item._id = item._id.toString();

    // If an IndividualTrashItem was found, add its quantity to the item
    if (item.individualTrashItem) {
      // item.individualTrashItem._id = item.individualTrashItem._id.toString();
      item.individualTrashItem._id = item.individualTrashItem._id.toString();
      item.individualTrashItem.itemId =
        item.individualTrashItem.itemId.toString();
      item.individualTrashItem.logId =
        item.individualTrashItem.logId.toString();
      item.quantity = item.individualTrashItem.quantity;
      // item.weight = item.individualTrashItem.weight; // Add this line if you also want to include weight
    } else {
      item.quantity = 0; // Default quantity
      // item.weight = 0; // Default weight
    }

    // Remove the individualTrashItem property from the item
    delete item.individualTrashItem;
    // Use the _id of the item as the key
    acc[item._id] = item;
    return acc;
  }, {});

  console.log(items);
  return { props: { items: items, logId: id } };
}

//   const result = await TrashItem.find({ deleted: false }, [ '-creator', '-__v', '-createdAt', '-updatedAt', '-deleted'])

//   const items = result.map((doc) => {
//     const item = doc.toObject()
//     item._id = item._id.toString();
//     return item
//   })
//   console.log(items)
//   return { props: { items: items, logId: id } }
// }
