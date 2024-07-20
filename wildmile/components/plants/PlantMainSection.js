"use client";
// import React from "react";
import React, { useState, useEffect } from "react";

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
  Popover,
} from "@mantine/core";
import classes from "/styles/PlantDetails.module.css"; // Adjust the path to your CSS module
import PlantEditForm from "./PlantEditForm"; // Adjust the import path as needed
import PlantImageUpload from "./PlantImageUpload"; // Adjust the import path as needed
import { useUser } from "lib/hooks";

export function PlantEditMode({ plant }) {
  const [editMode, setEditMode] = useState(false);
  const { user, loading } = useUser();
  // Effect to handle role-based access after user data is loaded
  useEffect(() => {
    if (loading || !user) {
      return;
    }
    console.log("EditModeSwitch:", user.admin);
    if (user.admin === false) {
    }
  }, [user, loading]); // Include loading in the dependency array

  const saveChanges = (updatedPlant) => {
    console.log(updatedPlant);
    setEditMode(false);
  };
  if (loading) {
    // Render a loading state or a placeholder to ensure consistency during hydration
    return <div>Loading...</div>;
  }

  return (
    <>
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
              {/* Ensure the button is only shown when user data is fully loaded and user is an admin */}
              {user && user.admin && (
                <>
                  <Button onClick={() => setEditMode(true)}>Edit</Button>

                  <PlantImageUpload plantId={plant._id} />
                </>
              )}
            </>
          )}
        </GridCol>
      </Grid>
    </>
  );
}

export default function PlantMainSection({ plant }) {
  //  const { user, loading } = useUser();
  //   console.log("User Role:", user);

  console.log("Plantmain:", plant);
  return (
    <>
      {/* <PlantEditMode plant={plant} /> */}

      <Grid>
        <GridCol span={{ base: 12, lg: 6 }}>
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
        <GridCol span={{ base: 12, lg: 6 }}>
          <Title order={1} className={classes.title}>
            {plant.commonName || plant.common_name || plant.scientificName}
          </Title>
          <Text order={2} size="sm" className={classes.subtitle}>
            {plant.scientificName || plant.scientific_name}
          </Text>

          {plant.notes && <Text className={classes.notes}>{plant.notes}</Text>}

          <Group spacing="xs">
            {plant.family && (
              <Badge
                color={
                  plant.color && plant.color.family
                    ? plant.color.family
                    : "grey"
                }
              >
                {plant.family}
              </Badge>
            )}
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
              <Popover width={300} position="bottom" withArrow shadow="md">
                <Popover.Target>
                  <Button size="xs">Synonyms</Button>
                </Popover.Target>
                <Popover.Dropdown>
                  <ul className={classes.synonymsList}>
                    {plant.synonyms.map((synonym, index) => (
                      <li key={index}>{synonym}</li>
                    ))}
                  </ul>
                </Popover.Dropdown>
              </Popover>
              <Title order={3} className={classes.subheading}>
                Synonyms
              </Title>
            </>
          )}
        </GridCol>
      </Grid>
    </>
  );
}
