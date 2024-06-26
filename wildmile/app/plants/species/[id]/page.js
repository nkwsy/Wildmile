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

// TODO change from id to slug
export async function getPlant(id) {
  await dbConnect();
  /* find all the data in our database */
  const result = await Plant.findOne({ slug: id }, [
    "-createdAt",
    "-updatedAt",
  ]);
  // const plant = result;
  // console.log("Plant:", result);
  const plant = result.toObject();
  delete plant.__v;
  // plant._id = String(plant._id);
  return plant;
}

export default async function Page({ params }) {
  console.log("Params:", params.id);

  const plant = await getPlant(params.id);

  return (
    <>
      <Suspense>
        <PlantDetails plant={plant} />
      </Suspense>
    </>
  );
}
