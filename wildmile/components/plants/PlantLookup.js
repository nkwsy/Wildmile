"use client";
import {
  Grid,
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
import { useState } from "react";
import { useForm } from "@mantine/form";
import Link from "next/link";
import { searchTrefleData } from "app/actions/PlantActions";
import { PlantCardUnformated } from "./PlantCard";
import classes from "/styles/imagecard.module.css";

export function PlantCard(raw_plant, setSelectedPlant) {
  let plant = {
    id: raw_plant.id,
    title:
      raw_plant.commonName || raw_plant.common_name || raw_plant.scientificName,
    subtitle: raw_plant.scientificName || raw_plant.scientific_name,
    image: raw_plant.thumbnail || raw_plant.image_url || "/No_plant_image.jpg",
    description: raw_plant.notes || "",
    family: raw_plant.family,
    color: raw_plant.color || "grey",
  };
  return (
    <Card
      key={raw_plant.id}
      onClick={() => setSelectedPlant(raw_plant)}
      withBorder
      padding="lg"
      radius="md"
      //   component={Link}
      //   href={`/plants/species/${plant.id}`}

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

export function PlantSearch({ setSelectedPlant }) {
  const [plant_results, setPlantResults] = useState([]);
  const form = useForm();

  const searchPlants = async () => {
    const result = await searchTrefleData(form.values.plant_name);
    setPlantResults(result);
    console.log("Result:", result);
  };

  return (
    <>
      <Group>
        <TextInput
          id="plant_name"
          placeholder="Search for a plant"
          {...form.getInputProps("plant_name")}
        />

        <Button onClick={searchPlants}>Search</Button>
      </Group>
      <SimpleGrid
        mt={40}
        cols={{ base: 2, sm: 2, lg: 5, xl: 4 }}
        breakpoints={[
          { maxWidth: "62rem", cols: 3, spacing: "md" },
          { maxWidth: "48rem", cols: 2, spacing: "sm" },
          { maxWidth: "36rem", cols: 1, spacing: "sm" },
        ]}
      >
        {plant_results.map((raw_plant) =>
          PlantCard(raw_plant, setSelectedPlant)
        )}
      </SimpleGrid>
    </>
  );
}
