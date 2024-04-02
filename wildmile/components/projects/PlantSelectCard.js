/* eslint-disable react/react-in-jsx-scope */
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
} from "@mantine/core";
import classes from "/styles/plantcard.module.css";

export default function PlantSelectCards(props) {
  const cardPlants = props.cardPlants;
  const selectedPlants = props.selectedPlants;
  return (
    <>
      <ScrollArea.Autosize className={classes.scrollItem} mah={1200}>
        {cardPlants.map((item, index) => (
          <Box
            //   component="button"
            className={classes.box}
            value={String(index)}
            key={item.id}
            onClick={item.onClick}
          >
            <Group wrap="nowrap" align="left">
              <Avatar src={item.image} radius="sm" size="xl" />
            </Group>
            <Group align="top" direction="column">
              <div>
                <Text className={classes.title}>{item.title}</Text>
                <Text size="sm" color="dimmed" fw={400}>
                  {item.subtitle}
                </Text>
              </div>
            </Group>
          </Box>
        ))}
      </ScrollArea.Autosize>
    </>
  );
}
