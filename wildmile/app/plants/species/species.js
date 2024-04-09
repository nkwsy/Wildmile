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
  CardSection,
  Group,
  Chip,
  ChipGroup,
} from "@mantine/core";
import Link from "next/link";

import classes from "/styles/imagecard.module.css";
import { useForm } from "@mantine/form";
import dbConnect from "/lib/db/setup";
import { useUser } from "lib/hooks";
import { PlantHandler } from "app/actions/PlantActions";
import Plant from "/models/Plant";
// Assuming this function is defined correctly and works as intended
/* Retrieves plant(s) data from mongodb database */
export async function getPlants() {
  await dbConnect();

  /* find all the data in our database */
  const result = await Plant.find({}, ["-createdAt", "-updatedAt"]);
  const plants = result.map((doc) => {
    const plant = doc.toObject();
    plant._id = String(plant._id);
    return plant;
  });
  plants.sort((a, b) => {
    const nameA = (a.scientific_name || a.scientificName).toUpperCase(); // ignore upper and lowercase
    const nameB = (b.scientific_name || b.scientificName).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  });
  return plants;
}

export function PlantCards(plants) {
  const plant_values = plants.map((plant) => ({
    id: plant._id,
    title: plant.commonName || plant.common_name || plant.scientificName,
    subtitle: plant.scientificName || plant.scientific_name,
    image: plant.thumbnail,
    description: plant.notes,
    family: plant.family,
    // tags: plant.family, plant.family_common_name ?? null.filter(Boolean),
  }));
  return plant_values;
}

export default async function Species() {
  const allPlants = await getPlants();
  const plants = PlantCards(allPlants);

  console.log("Plants:", plants);
  return (
    <>
      {plants.map((plant, index) => (
        <Card
          key={index}
          //   onClick={() => updateFormValues(plant)}
          withBorder
          padding="lg"
          radius="md"
          component={Link}
          href={`/plants/species/${plant.id}`}

          //   className={classes.mantineCard}
        >
          <CardSection mb="sm">
            <Image
              src={plant.image || "/No_plant_image.jpg"}
              alt={plant.title}
            />
          </CardSection>

          <Group align="top" direction="column">
            <div>
              <Title className={classes.title}>{plant.title}</Title>
              <Text
                size="sm"
                color="dimmed"
                fs="italic"
                c="dimmed"
                className={classes.subtitle}
              >
                {plant.subtitle}
              </Text>
              <Text size="sm" color="dimmed" className={classes.description}>
                {plant.family}
              </Text>
            </div>
          </Group>
        </Card>
      ))}
    </>
  );
}
