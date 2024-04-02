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
} from "@mantine/core";

export default function PlantSelectCards(props) {
  const [showAvatar, setShowAvatar] = useState(true);

  const cardPlants = props.cardPlants;
  const selectedPlants = props.selectedPlants;

  const toggleAvatar = () => {
    setShowAvatar(!showAvatar);
  };
  return (
    <>
      <Button onClick={toggleAvatar}>
        {showAvatar ? "Hide Avatar" : "Show Avatar"}
      </Button>
      <ScrollArea.Autosize className={classes.scrollItem} mah={1200}>
        {cardPlants.map((item, index) => (
          <Box
            //   component="button"
            className={classes.box}
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
          </Box>
        ))}
      </ScrollArea.Autosize>
    </>
  );
}
