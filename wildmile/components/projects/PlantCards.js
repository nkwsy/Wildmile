"use client";
import React, { useState, useEffect } from "react";
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
  Box,
  BackgroundImage,
  ScrollArea,
  Group,
  Avatar,
  Accordion,
  Autocomplete,
  Combobox,
  useCombobox,
  Stack,
} from "@mantine/core";
import SearchableMultiSelect from "./SearchBox";
// import dbConnect from "../../lib/db/setup";
// import Plant from "../../models/Plant";
// import { useStyles } from "../image_card_grid";
import { useDisclosure, useViewportSize } from "@mantine/hooks";
import classes from "/styles/plantcard.module.css";
// import PlantHandler from "../../app/actions/PlantActions";
import { PlantHandler } from "/app/actions/PlantActions";
import { set } from "mongoose";
import PlantAccordian from "./PlantAccordian";
import PlantSelectCards from "./PlantSelectCard";
import PlantSelectTable from "./PlantSelectTable";
import ClientContext, { useClient, useClientState } from "./context_mod_map";
import { KonvaGrid } from "./ModuleTemplate";
import { use } from "passport";
// import { PlantCardFromId } from "components/plants/PlantCard";
import PlantInfoBox from "./PlantInfoBox";
import { PlantMenu } from "./PlantMenu";
export function InfoBox() {
  const [currentPlantHighlight, setCurrentPlantHighlight] = useState(null);

  const plant_highlight = useClientState("plantCellHover");
  useEffect(() => {
    if (plant_highlight) {
      setCurrentPlantHighlight(plant_highlight.plant_id);
    }
  }, [plant_highlight]);

  // const plant_id = plant_highlight?.plant_id;
  if (currentPlantHighlight) {
    return <PlantCardFromId plant_id={currentPlantHighlight} />;
  }
  return <></>;
}

export function PlantCards(props) {
  const { plants, dispatch, state } = useClient();
  const [cardPlants, setCardPlants] = useState([]);
  const [isReady, setReady] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Modal logic
  const [opened, { open, close }] = useDisclosure(false);

  // const { isOpen, close, toggle } = useDisclosure();
  const selPlants = useClientState("selectedPlants");
  console.log("Selected Plants:", selPlants);

  const toggleAvatar = () => {
    setShowAvatar(!showAvatar);
  };

  const sortCardPlants = (plants) => {
    return plants.sort((a, b) => {
      if (a.family < b.family) {
        return -1;
      }
      if (a.family > b.family) {
        return 1;
      }
      if (a.scientific_name < b.scientific_name) {
        return -1;
      }
      if (a.scientific_name > b.scientific_name) {
        return 1;
      }
      return 0;
    });
  };

  useEffect(() => {
    async function handlePlantSearch() {
      // const raw_plants = await PlantHandler();
      // const raw_plants = await AllPlants();
      // const plants = JSON.parse(raw_plants);
      console.log("Plants:", plants);
      const sorted_plants = sortCardPlants(plants);
      const plant_values = sorted_plants.map((plant) => ({
        id: plant._id,
        title: plant.commonName || plant.common_name || plant.scientificName,
        subtitle: plant.scientificName || plant.scientific_name,
        image: plant.thumbnail,
        description: plant.notes,
        color: plant.color,
        family: plant.family,
        url: `/plants/species/${plant.slug}` || "",
        tags: [
          ...(plant.tags ?? []),
          plant.family,
          plant.family_common_name ?? null,
        ].filter(Boolean),
        onClick: () => {
          const plantMap = {
            id: plant._id,
            title:
              plant.commonName || plant.common_name || plant.scientificName,
            subtitle: plant.scientificName || plant.scientific_name,
            image: plant.thumbnail,
            color: plant.color,
            description: plant.notes,
            tags: [
              ...(plant.tags ?? []),
              plant.family,
              plant.family_common_name ?? null,
            ].filter(Boolean),
          };
          dispatch({
            type: "TOGGLE_PLANT_SELECTION",
            payload: plantMap,
          });
          console.log("Plant clicked:", plant);
        },
        // tags: plant.tags?.slice(0, 4),
      }));
      setCardPlants(plant_values);
      setReady(true);

      const uniqueTags = plant_values.reduce((tags, plant) => {
        plant.tags.forEach((tag) => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
        });
        return tags;
      }, []);

      console.log("Unique Tags:", uniqueTags);
    }

    handlePlantSearch();
  }, [plants]);

  if (!isReady) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    );
  } else {
    return (
      <>
        <Stack variant="contained">
          <Modal opened={opened} onClose={close} title="Planting Template">
            <KonvaGrid />
          </Modal>
          <PlantInfoBox />
          <Group>
            <Button onClick={open}>Create Template</Button>
            <Button onClick={toggleAvatar}>
              {showAvatar ? "Hide Avatar" : "Show Avatar"}
            </Button>
          </Group>
          <SearchableMultiSelect itemsMap={cardPlants} />
          {showAvatar && (
            <PlantSelectCards
              cardPlants={cardPlants}
              selectedPlants={state.selectedPlants}
            />
          )}
          {!showAvatar && <PlantSelectTable cardPlants={cardPlants} />}
        </Stack>
      </>
    );
    // return <PlantAccordian cardPlants={cardPlants} />;
    // return (
    //   <>
    //     <ScrollArea.Autosize type="hover" h="100%">
    //       <SimpleGrid
    //         mt="sm"
    //         pb="xs"
    //         // cols={4}
    //         w={{ base: 200, sm: 400, lg: 500 }}
    //         cols={{ base: 2, sm: 2, lg: 3, xl: 3 }}
    //         // breakpoints={[
    //         //   { maxWidth: "62rem", cols: 3, spacing: "md" },
    //         //   { maxWidth: "48rem", cols: 2, spacing: "sm" },
    //         //   { maxWidth: "36rem", cols: 1, spacing: "sm" },
    //         // ]}
    //       >
    //         {cardPlants.map((plant, index) => {
    //           return (
    //             <Card
    //               key={plant.title + String(index)}
    //               withBorder
    //               padding="sm"
    //               radius="md"
    //               container-type="inline-size"
    //               w={{ base: 50, sm: 100, lg: 150 }}
    //               className={classes.squareCard}
    //             >
    //               {/* <div className={classes.squareCardContent}> */}
    //               <Card.Section>
    //                 <Image
    //                   src={plant.image || "/No_plant_image.jpg"}
    //                   alt={plant.title}
    //                   // w="15%"
    //                   // w="auto"
    //                   // fit="cover"
    //                   // style={{
    //                   //   width: "100%",
    //                   //   height: "100%",
    //                   //   objectFit: "cover",
    //                   // }}
    //                 />
    //               </Card.Section>
    //               <Title fw={700} className={classes.title} mt={3}>
    //                 {plant.title}
    //               </Title>
    //               <Text
    //                 fs="italic"
    //                 fw={700}
    //                 className={classes.subtitle}
    //                 c="dimmed"
    //               >
    //                 {plant.subtitle}
    //               </Text>
    //               {/* <Text mb='xs'>
    //       {plant.description}
    //     </Text> */}
    //               {/* </div> */}
    //             </Card>
    //           );
    //         })}
    //       </SimpleGrid>
    //     </ScrollArea.Autosize>
    //   </>
    // );
  }
}
