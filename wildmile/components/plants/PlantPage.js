"use client";
// import React from "react";
import React, { useState } from "react";

import {
  Card,
  Image,
  Text,
  Title,
  Badge,
  Group,
  Container,
  Grid,
  Col,
  GridCol,
  Button,
} from "@mantine/core";
import classes from "/styles/PlantDetails.module.css"; // Adjust the path to your CSS module
import PlantEditForm from "./PlantEditForm"; // Adjust the import path as needed

const PlantDetails = ({ plant }) => {
  const [editMode, setEditMode] = useState(false);

  const saveChanges = (updatedPlant) => {
    // Here you would typically send the updated plant details to your backend
    console.log(updatedPlant);
    setEditMode(false);
  };

  return (
    <Container className={classes.container}>
      <Grid>
        <GridCol span={12}>
          {editMode ? (
            <PlantEditForm
              plant={plant}
              onSave={saveChanges}
              onCancel={() => setEditMode(false)}
            />
          ) : (
            <>
              <Title order={1} className={classes.title}>
                {plant.commonName || plant.common_name || plant.scientificName}
              </Title>
              <Text size="sm" className={classes.subtitle}>
                {plant.scientificName || plant.scientific_name}
              </Text>
              <Button onClick={() => setEditMode(true)}>Edit</Button>
            </>
          )}
        </GridCol>
      </Grid>
      <Grid>
        <GridCol span={6}>
          {plant.thumbnail || plant.image_url ? (
            <Image
              src={plant.thumbnail || plant.image_url}
              alt={
                plant.common_name || plant.commonName || plant.scientificName
              }
              className={classes.mainImage}
            />
          ) : null}
        </GridCol>
        <GridCol span={6}>
          <Title order={1} className={classes.title}>
            {plant.commonName || plant.common_name || plant.scientificName}
          </Title>
          <Text order={2} size="sm" className={classes.subtitle}>
            {plant.scientificName || plant.scientific_name}
          </Text>

          {plant.notes && <Text className={classes.notes}>{plant.notes}</Text>}

          <Group spacing="xs">
            {plant.family && <Badge>{plant.family}</Badge>}
            {plant.family_common_name && (
              <Badge>{plant.family_common_name}</Badge>
            )}
            {plant.genus && <Badge>{plant.genus}</Badge>}
          </Group>

          <Text size="sm" className={classes.metadata}>
            Author: {plant.author || "N/A"}
            <br />
            Bibliography: {plant.bibliography || "N/A"}
            <br />
            Status: {plant.status || "N/A"}
            <br />
            Year: {plant.year || "N/A"}
          </Text>

          {plant.synonyms && plant.synonyms.length > 0 && (
            <>
              <Title order={3} className={classes.subheading}>
                Synonyms
              </Title>
              <ul className={classes.synonymsList}>
                {plant.synonyms.map((synonym, index) => (
                  <li key={index}>{synonym}</li>
                ))}
              </ul>
            </>
          )}
        </GridCol>
      </Grid>
      <Grid>
        {plant.images?.map((image, index) => (
          <GridCol span={4} key={index}>
            <Image
              src={image.url}
              alt={`Plant Image ${index + 1}`}
              className={classes.galleryImage}
            />
          </GridCol>
        ))}
      </Grid>
      {plant.botanicPhoto || plant.image_url ? (
        <Image
          src={plant.botanicPhoto || plant.image_url}
          alt={plant.commonName || plant.scientificName}
          className={classes.mainImage}
        />
      ) : null}
    </Container>
  );
};

export default PlantDetails;
