import {
  SimpleGrid,
  Text,
  Card,
  Image,
  Badge,
  Modal,
  Title,
  Container,
  TextInput,
  Textarea,
  Button,
} from "@mantine/core";
import { Suspense } from "react";

import dbConnect from "/lib/db/setup";
import Plant from "/models/Plant";
import { useStyles } from "/components/image_card_grid";
import { useDisclosure } from "@mantine/hooks";
import { useForm } from "@mantine/form";
import classes from "/styles/imagecard.module.css";
// import plants from "pages/api/plants";
import { get } from "mongoose";
import Species from "./species";
import { getPlants } from "/app/actions/PlantActions";

export default async function Page() {
  return (
    <>
      <Container maxwidth="95%" my="5rem">
        <Title order={2} className={classes.title} align="center" mt="sm">
          Urban River Plants Resources
        </Title>
        <Text
          color="dimmed"
          className={classes.description}
          align="center"
          mt="md"
        >
          Collecting and sharing data about Urban River's projects.
        </Text>
        <SimpleGrid
          mt={40}
          cols={{ base: 2, sm: 2, lg: 5, xl: 4 }}
          breakpoints={[
            { maxWidth: "62rem", cols: 3, spacing: "md" },
            { maxWidth: "48rem", cols: 2, spacing: "sm" },
            { maxWidth: "36rem", cols: 1, spacing: "sm" },
          ]}
        >
          {/* <Suspense fallback={<div>Loading...</div>}> */}
          <Species />
          {/* </Suspense> */}
        </SimpleGrid>
      </Container>
    </>
  );
}
