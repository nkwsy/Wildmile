"use client";
import { useState } from "react";
import {
  Modal,
  Button,
  Text,
  Group,
  Title,
  Image,
  List,
  ListItem,
  Divider,
} from "@mantine/core";

function PlantInfoModal({ plantData = {} }) {
  const [opened, setOpened] = useState(false);

  // Default empty object fallbacks and array checks
  const {
    common_name = "Unknown Plant",
    scientific_name = "Unknown",
    year = "N/A",
    bibliography = "N/A",
    author = "Unknown",
    status = "Unknown",
    rank = "Unknown",
    observations = "No observations available",
    image_url = "",
    family = "Unknown",
    genus = "Unknown",
    distribution = { native: [] },
    common_names = {},
    flower = { color: [], conspicuous: false },
    foliage = { texture: "Unknown", color: [] },
    fruit_or_seed = { color: [], conspicuous: false },
  } = plantData;

  return (
    <>
      <Button onClick={() => setOpened(true)}>Show Plant Info</Button>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title={common_name || "Plant Information"}
        size="lg"
      >
        <Group direction="column" spacing="md">
          <Title order={3}>{scientific_name}</Title>
          <Text>
            Author: {author} ({year})
          </Text>
          <Text>
            Status: {status} - {rank}
          </Text>
          <Text>Bibliography: {bibliography}</Text>
          <Text>Observations: {observations}</Text>
          <Text>
            Family: {family}, Genus: {genus}
          </Text>
          <Text>{`${JSON.stringify(plantData)}`}</Text>
          <Divider label="Distribution" labelPosition="center" />
          <List>
            {distribution.native.length ? (
              distribution.native.map((area, index) => (
                <ListItem key={index}>{area}</ListItem>
              ))
            ) : (
              <Text>No native distribution data available</Text>
            )}
          </List>

          <Divider label="Common Names" labelPosition="center" />
          {Object.entries(common_names).length ? (
            Object.entries(common_names).map(([key, value]) => (
              <Text key={key}>
                {key.toUpperCase()}: {value.join(", ")}
              </Text>
            ))
          ) : (
            <Text>No common names available</Text>
          )}

          <Divider label="Flower Characteristics" labelPosition="center" />
          <Text>
            Color: {flower.color.length ? flower.color.join(", ") : "Unknown"},
            Conspicuous: {flower.conspicuous ? "Yes" : "No"}
          </Text>

          <Divider label="Foliage Characteristics" labelPosition="center" />
          <Text>
            Texture: {foliage.texture}, Color:{" "}
            {foliage.color ? foliage.color.join(", ") : "Unknown"}
            {/* {foliage.color.length ? foliage.color.join(", ") : "Unknown"} */}
          </Text>

          <Divider
            label="Fruit or Seed Characteristics"
            labelPosition="center"
          />
          <Text>
            Color:{" "}
            {fruit_or_seed.color ? fruit_or_seed.color.join(", ") : "Unknown"},
            Conspicuous: {fruit_or_seed.conspicuous ? "Yes" : "No"}
          </Text>
        </Group>
      </Modal>
    </>
  );
}

export default PlantInfoModal;
