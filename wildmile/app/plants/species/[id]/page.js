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
import { useForm } from "@mantine/form";
import classes from "/styles/imagecard.module.css";
import PlantDetails from "components/plants/PlantPage";

export async function getPlant(id) {
  await dbConnect();

  /* find all the data in our database */
  const result = await Plant.findOne({ _id: id }, ["-createdAt", "-updatedAt"]);
  const plant = result;
  console.log("Plant:", result);

  // plant._id = String(plant._id);
  return plant;
}
export default async function Page({ params }) {
  console.log("Params:", params.id);

  const plant = await getPlant(params.id);

  return (
    <>
      {/* <Container maxwidth="95%" my="5rem">
        <Title order={2} align="left" mt="sm">
          {plant.commonName || plant.common_name || plant.scientificName}
        </Title>
        <Text
          color="dimmed"
          className={classes.description}
          align="left"
          mt="md"
        >
          {plant.scientificName || plant.scientific_name}
        </Text> */}
      <PlantDetails plant={plant} />
      {/* </Container> */}
    </>
  );
}
