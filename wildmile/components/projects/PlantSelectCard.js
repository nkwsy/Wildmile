// "use client";
import React, { useState } from "react";
import classes from "styles/plantcard.module.css";
import {
  Box,
  Paper,
  Stack,
  Text,
  Group,
  Avatar,
  ScrollArea,
  Button,
  AccordianItem,
  Chip,
  Table,
} from "@mantine/core";
import { useClientState } from "./context_mod_map";

export default function PlantSelectCards(props) {
  const [showAvatar, setShowAvatar] = useState(true);

  const cardPlants = props.cardPlants;
  const selectedPlants = useClientState("selectedPlants");

  const toggleAvatar = () => {
    setShowAvatar(!showAvatar);
  };
  return (
    <>
      <ScrollArea.Autosize className={classes.scrollItem} mah={1200}>
        {cardPlants.map((item, index) => (
          <Paper
            //   component="button"
            className={` ${
              selectedPlants instanceof Map && selectedPlants.has(item.id)
                ? classes.selectedBox
                : ""
            } ${classes.box}`}
            withBorder
            value={String(index)}
            key={item.id}
            onClick={item.onClick}
          >
            {showAvatar && (
              <Group wrap="nowrap" align="left">
                <Avatar src={item.image} radius="sm" size="xl" />
              </Group>
            )}
            <Group align="top" direction="column">
              <div>
                <Text className={classes.title}>{item.title}</Text>
                <Text size="sm" color="dimmed" fw={400}>
                  {item.subtitle}
                </Text>
                <Chip.Group>
                  {item.tags.map((tag, index) => (
                    <Chip
                      key={tag + String(index)}
                      //   color="blue"
                      radius="lg"
                      className={classes.chip}
                    >
                      {tag}
                    </Chip>
                  ))}
                </Chip.Group>
              </div>
            </Group>
            {/* <Group align="right" direction="column"> */}
          </Paper>
        ))}
      </ScrollArea.Autosize>
    </>
  );
}
