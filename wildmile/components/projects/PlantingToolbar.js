import React, { useState, useEffect } from "react";
import classes from "styles/plantcard.module.css";
import { useHotkeys } from "@mantine/hooks";

import {
  ScrollArea,
  Table,
  Text,
  Chip,
  Card,
  Group,
  CardSection,
  Avatar,
  Indicator,
  Box,
} from "@mantine/core";
import { useClient, useClientState } from "./context_mod_map";
import { set } from "mongoose";
import { PlantingTemplate } from "./PlantingTemplate";
import PlantTemplateChip from "./PlantTemplateChip";

export default function PlantingToolbar() {
  const selectedPlants = useClientState("selectedPlants");
  const selectedPlantId = useClientState("selectedPlantId");
  const { dispatch } = useClient();

  // const handleKeyPress = (event) => {
  //     const key = event.key;
  //     const number = Number(key);
  //     if (!isNaN(number) && number < selectedPlants.length) {
  //         const plant = selectedPlants[number];
  //         setSelectedPlantId(plant.id);
  //     }
  // };
  const setSelectedPlantId = (id) => () => {
    dispatch({ type: "TOGGLE_SELECTED_PLANT", payload: id });
  };
  const hotkeys = Array.from(selectedPlants).map((plant, index) => [
    String(index + 1), // Assuming you want to start hotkeys from '1'
    () => setSelectedPlantId(plant.id),
  ]);
  console.log("Hotkeys: ", hotkeys);
  useHotkeys(
    Array.from(selectedPlants).map((plant, index) => [
      String(index + 1), // Assuming you want to start hotkeys from '1'
      () => setSelectedPlantId(plant.id),
    ])
  );

  return (
    <>
      <Card
        shadow="xs"
        padding="lg"
        pl={8}
        radius="sm"
        withBorder
        justify-content="flex-start"
        align="flex-start"
      >
        <PlantingTemplate />
        <CardSection withBorder inheritPadding py="xs">
          {[...selectedPlants.entries()].map(([id, item], index) => (
            <Box
              key={id}
              className={` ${
                selectedPlantId === item.id ? classes.selectedBox : ""
              } `}
              value={String(index)}
              // key={item.id}
              onClick={setSelectedPlantId(item.id)}
            >
              <Indicator inline label={index + 1} size={16}>
                <Avatar src={item.image} radius="sm" size="xl" />
              </Indicator>
              <Group align="right" direction="column">
                <Text size="xs" className={classes.title}>
                  {item.title}
                </Text>
              </Group>
              <Group align="right" direction="column">
                <Text size="xs" color="dimmed" fw={400}>
                  {item.subtitle}
                </Text>
              </Group>
              <PlantTemplateChip plantId={item.id} />
            </Box>
          ))}
        </CardSection>
      </Card>
    </>
  );
}
