import React from "react";
import classes from "styles/plantcard.module.css";
import { ScrollArea, Table, Text, Chip } from "@mantine/core";
import { useClientState } from "./context_mod_map";

export default function PlantSelectTable(props) {
  const cardPlants = props.cardPlants;
  const selectedPlants = useClientState("selectedPlants");

  return (
    <ScrollArea.Autosize className={classes.scrollItem} mah={1200}>
      <Table striped highlightOnHover>
        <thead>
          <tr>
            <th>Common Name</th>
            <th>Scientific Name</th>
            <th>Tags</th>
          </tr>
        </thead>
        <tbody>
          {cardPlants.map((item, index) => (
            <tr
              key={item.id}
              onClick={item.onClick}
              className={
                selectedPlants instanceof Map && selectedPlants.has(item.id)
                  ? classes.selectedRow
                  : ""
              }
            >
              <td>
                <Text className={classes.title}>{item.title}</Text>
              </td>
              <td>
                <Text size="sm" color="dimmed" fw={400}>
                  {item.subtitle}
                </Text>
              </td>
              <td>
                <Chip.Group>
                  {item.tags.map((tag, tagIndex) => (
                    <Chip
                      key={tag + String(tagIndex)}
                      radius="lg"
                      className={classes.chip}
                    >
                      {tag}
                    </Chip>
                  ))}
                </Chip.Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </ScrollArea.Autosize>
  );
}
