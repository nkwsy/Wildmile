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
import { convertIdsToString } from "lib/utils";
// TODO change from id to slug
export async function getPlant(id) {
  await dbConnect();
  /* find all the data in our database */
  const result = await Plant.findOne({ slug: id }, [
    "-createdAt",
    "-updatedAt",
  ]).lean();
  // const flatResult = result.toJSON();
  // const plant = result;
  // console.log("Plant:", result);
  if (result) {
    convertIdsToString(result);
    // Remove __v field
    delete result.__v;
  }
  console.log("Result:", result);
  // const plant = result.toObject({ transform: true });
  // delete plant.__v;
  // result._id = result._id.toString();
  // console.log("FlatResult:", plant);
  return result;
}

export default async function Page({ params }) {
  console.log("Params:", params.id);

  const plant = await getPlant(params.id);
  console.log("Plant:", plant);
  return (
    <>
      <Suspense>
        <PlantDetails plant={plant} />
      </Suspense>
    </>
  );
}
