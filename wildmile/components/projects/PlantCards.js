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
} from "@mantine/core";
// import dbConnect from "../../lib/db/setup";
// import Plant from "../../models/Plant";
import { useStyles } from "../image_card_grid";
import { useDisclosure } from "@mantine/hooks";
import classes from "/styles/plantcard.module.css";
// import PlantHandler from "../../app/actions/PlantActions";
import { PlantHandler } from "/app/actions/PlantActions";
import { set } from "mongoose";
import PlantAccordian from "./PlantAccordian";
import ClientContext, { useClient } from "./context_mod_map";

export function PlantCards(props) {
  const { plants, selectedPlants } = useClient();
  const [cardPlants, setCardPlants] = useState([]);
  const [isReady, setReady] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  // const { isOpen, close, toggle } = useDisclosure();
  useEffect(() => {
    async function handlePlantSearch() {
      // const raw_plants = await PlantHandler();
      const use_plants = plants || selectedPlants;
      // const raw_plants = await AllPlants();
      // const plants = JSON.parse(raw_plants);
      console.log("Plants:", plants);

      const plant_values = plants.map((plant) => ({
        title: plant.commonName || plant.common_name || plant.scientificName,
        subtitle: plant.scientificName || plant.scientific_name,
        image: plant.thumbnail,
        description: plant.notes,
        // tags: plant.tags.slice(0, 4),
      }));
      setCardPlants(plant_values);
      setReady(true);
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
    return <PlantAccordian cardPlants={cardPlants} />;

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
