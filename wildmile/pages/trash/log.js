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
import Router from "next/router";
import TrashForm from "components/trash_form";
import TrashItem from "/models/TrashItem";
import dbConnect from "/lib/db/setup";

export default function CreateLog(props) {
  const [errorMsg, setErrorMsg] = useState("");
  const [active, setActive] = useState(0);
  const [visible, handlers] = useDisclosure(false);

  const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const trashFormVals = Object.fromEntries(
    props.items.map((item) => {
      return [item.name, 0];
    })
  );

  const form = useForm({
    initialValues: {
      site: "",
      participants: 1,
      timeStart: new Date(),
      timeEnd: new Date(),
      trashiness: 1,
      temp: 65,
      wind: 1,
      cloud: 1,
      notes: "",
      items: trashFormVals,
    },

    validate: (values) => {
      if (active === 0) {
        return {
          site: values.site === "" ? "Must choose a site location" : null,
          timeEnd:
            values.timeEnd < values.timeStart
              ? "Time ended cannot be before time started"
              : null,
        };
      }

      return {};
    },
  });

  async function createLog() {
    handlers.open();
    console.log(form.values);
    const res = await fetch("/api/trash/logs", {
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

    // Get the _id from the server response
    const data = await res.json();
    const id = data._id;

    // Navigate to the trash/edit/[id].js page
    Router.push(`/trash/edit/${id}`);
  }

  const nextStep = () => {
    scrollToTop();
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current;
      }
      return current < 2 ? current + 1 : current;
    });
  };

  const prevStep = () => {
    scrollToTop();
    setActive((current) => (current > 0 ? current - 1 : current));
  };

  return (
    <Container visibleFrom="md" maw="95%" my="6rem">
      <Paper withBorder shadow="md" py={"md"} px={"xl"} mt={30} radius="md">
        <Title mb={30} align="center">
          Create a new trash log
        </Title>
        <TrashForm form={form} />
        <Group justify="right" mt="xl">
          <Button onClick={createLog}>Submit</Button>
        </Group>
      </Paper>
    </Container>
  );
}

export async function getStaticProps() {
  await dbConnect();

  /* find all the data in our database */
  const result = await TrashItem.find({ deleted: false }, [
    "-_id",
    "-creator",
    "-__v",
    "-createdAt",
    "-updatedAt",
    // "-deleted",
  ]);
  const items = result.map((doc) => {
    return doc.toObject();
  });

  return { props: { items: items } };
}
