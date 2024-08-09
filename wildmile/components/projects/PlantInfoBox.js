"use client";
import {
  SimpleGrid,
  Text,
  Card,
  Image,
  Badge,
  Paper,
  Avatar,
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
  ActionIcon,
} from "@mantine/core";
import Link from "next/link";
import { getPlant } from "/app/actions/PlantActions";
import classes from "/styles/imagecard.module.css";
import cardClasses from "/styles/plantcard.module.css";
import { useEffect, useState } from "react";
import { useClientState } from "./context_mod_map";
import { IconLink } from "@tabler/icons-react";
import exp from "constants";

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
    family: plant_data.family || plant_data.family_common_name || "",
    color: plant_data.color || { family: "grey" },
    // tags: [
    //   ...(plant_data.tags ?? []),
    //   plant_data.family,
    //   plant_data.family_common_name ?? null,
    // ].filter(Boolean),
    tags: plant_data.tags || [],
    url: `/plants/species/${plant_data.slug}` || "",

    // tags: plant.family, plant.family_common_name ?? null.filter(Boolean),
  };
  //   return PlantCard({ plant });
  return plant;
}
export function PlantInfoCard({ plant }) {
  return (
    <Card // key={index} // onClick={()=> updateFormValues(plant)}
      withBorder
      padding="lg"
      radius="md"
      component={Link}
      href={`/plants/species/${plant.slug}`}

      // className={classes.mantineCard}
    >
      <CardSection mb="sm">
        <Image
          src={plant.image || "/No_plant_image.jpg"}
          alt={plant.title}
          h="auto"
          w="100%"
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
          {/* <Text size="sm" color="dimmed" className={classes.description}>
                {plant.family}
            </Text> */}
          <Badge variant="light" color={plant.color.family}>
            {plant.family}
          </Badge>
          <ActionIcon component={Link} href={plant.url} right="xs">
            <IconLink />
          </ActionIcon>
          {plant.tags && (
            <ChipGroup>
              {plant.tags.map((tag, index) => (
                <Badge
                  key={tag + String(index)}
                  className={classes.badge}
                  color={plant.color && plant.color.family} // Add a conditional check before accessing the family property
                  radius="lg"
                >
                  {tag}
                </Badge>
              ))}
            </ChipGroup>
          )}
        </div>
      </Group>
    </Card>
  );
}
export function PlantInfoCell({ plant }) {
  return (
    <Paper className={cardClasses.box}>
      <Group wrap="nowrap" align="left">
        <Avatar src={plant.image} radius="sm" size="xl" />
      </Group>
      <Group align="top" direction="column">
        <div>
          <Text className={classes.title}>{plant.title}</Text>
          <Text size="sm" color="dimmed" fw={400}>
            {plant.subtitle}
          </Text>
          <Chip.Group>
            <Badge variant="light" color={plant.color.family}>
              {plant.family}
            </Badge>
          </Chip.Group>
          {plant.tags && (
            <ChipGroup>
              {plant.tags.map((tag, index) => (
                <Badge
                  key={tag + String(index)}
                  className={classes.badge}
                  color={plant.color && plant.color.family} // Add a conditional check before accessing the family property
                  radius="lg"
                >
                  {tag}
                </Badge>
              ))}
            </ChipGroup>
          )}
        </div>
      </Group>
      {/* <Group align="right" direction="column"> */}
      <ActionIcon
        component={Link}
        href={plant.url}
        size="input-xs"
        right="xs"
        variant="default"
      >
        <IconLink />
      </ActionIcon>
    </Paper>
  );
}
export default function PlantInfoBox() {
  const [plant, setPlant] = useState(null);
  const [plant_id, setPlantId] = useState(null);
  // const plant_highlight = useClientState("plantCellHover");
  const plant_highlight = useClientState("selectedPlantCell");
  console.log("PlantHighlight:", plant_highlight);
  useEffect(() => {
    const lastValue = Array.from(plant_highlight.values()).pop();
    if (lastValue && lastValue.plant_id !== plant_id) {
      setPlantId(lastValue.plant_id);
    }
  }, [plant_highlight]);
  useEffect(() => {
    const fetchPlant = async () => {
      const response = await fetch(`/api/plants/getPlant/${plant_id}`, {
        next: { tags: ["individualPlants"] },
      });
      console.log("Fetching and updating plants...");
      const raw_response = await response.json();
      // Simulate fetching data
      const data = JSON.parse(raw_response);
      // const plant_data = await getPlant(plant_id);
      console.log("PlantData:", data);
      setPlant(PlantCardUnformated(data));
    };
    // if (plant_highlight?.plant === plant_id) {
    //   return;
    // }
    // if (plant_highlight?.plant) {
    //   setPlantId(plant_highlight.plant);
    // }
    if (plant_id) {
      fetchPlant();
    }
  }, [plant_id]);
  if (!plant) {
    return <></>;
  }
  if (plant) {
    return <PlantInfoCell plant={plant} />;
    // return <PlantInfoCard plant={plant} />;
  }
}
