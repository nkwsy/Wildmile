"use server";
import React from "react";

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
import PlantImageSection from "./PlantImageSection";
import PlantMainSection from "./PlantMainSection";
import { PlantEditMode } from "./PlantMainSection";
export default async function PlantDetails({ plant }) {
  return (
    <>
      <Container className={classes.container}>
        <PlantEditMode plant={plant} />
        <PlantMainSection plant={plant} />
        <PlantImageSection plantId={String(plant._id)} />
      </Container>
    </>
  );
}
