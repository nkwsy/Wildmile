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

export function PlantCardUnformated(plant_data) {
  const plant = {
    id: plant_data._id,
    title:
      plant_data.commonName ||
      plant_data.common_name ||
      plant_data.scientificName,
    subtitle: plant_data.scientificName || plant_data.scientific_name,
    image:
      plant_data.thumbnail || plant_data.image_url || "/No_plant_image.jpg",
    description: plant_data.notes || "",
    family: plant_data.family,
    color: plant_data.color || "grey",

    // tags: plant.family, plant.family_common_name ?? null.filter(Boolean),
  };
  //   return PlantCard({ plant });
  return plant;
}

export default async function PlantCard({ plant }) {
  return (
    <Card
      //   key={index}
      //   onClick={() => updateFormValues(plant)}
      withBorder
      padding="lg"
      radius="md"
      component={Link}
      href={`/plants/species/${plant.id}`}

      //   className={classes.mantineCard}
    >
      <CardSection mb="sm">
        <Image src={plant.image || "/No_plant_image.jpg"} alt={plant.title} />
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
          {/* <Text size="sm" color="dimmed" className={classes.description}>
      {plant.family}
    </Text> */}
          <Badge variant="light" color={plant.color.family}>
            {plant.family}
          </Badge>
        </div>
      </Group>
    </Card>
  );
}
