// "use client";
import React, { useState } from "react";
import classes from "styles/plantcard.module.css";
import {
  Box,
  Paper,
  Badge,
  Stack,
  Text,
  Group,
  Avatar,
  ScrollArea,
  Button,
  AccordianItem,
  Chip,
  Table,
  ActionIcon,
} from "@mantine/core";
import { useClientState } from "./context_mod_map";
import { IconLink } from "@tabler/icons-react";
import Link from "next/link";
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
                    <Badge
                      key={tag + String(index)}
                      className={classes.badge}
                      color={item.color && item.color.family} // Add a conditional check before accessing the family property
                      radius="lg"
                    >
                      {tag}
                    </Badge>
                  ))}
                </Chip.Group>
              </div>
            </Group>
            {/* <Group align="right" direction="column"> */}
            <ActionIcon
              component={Link}
              href={item.url}
              size="input-xs"
              right="xs"
              variant="default"
            >
              <IconLink />
            </ActionIcon>
          </Paper>
        ))}
      </ScrollArea.Autosize>
    </>
  );
}
