"use client";

import React, { useState, useEffect } from "react";
import {
  Paper,
  Button,
  Group,
  Stack,
  ActionIcon,
  ActionIconGroup,
  Tooltip,
  ButtonGroup,
  Grid,
  GridCol,
  ScrollArea,
} from "@mantine/core";
import { useImage } from "./ContextCamera";
import { ImageAnnotation } from "./ImageAnnotation";
import { ImageFilterControls } from "./ImageFilterControls";
import WildlifeSearch from "./WildlifeSearch";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

export const ImageAnnotationPage = ({ initialImageId }) => {
  const [currentImage, setCurrentImage] = useImage();
  const [deployments, setDeployments] = useState([]);

  // In your component, use initialImageId to fetch and set the initial image
  useEffect(() => {
    fetchDeployments();
    if (initialImageId) {
      // Fetch and set the specific image
      fetchCamtrapImage({ selectedImageId: initialImageId });
    } else {
      // Your existing logic for getting the next image
      fetchCamtrapImage();
    }
  }, [initialImageId]);

  const fetchDeployments = async () => {
    try {
      const response = await fetch("/api/cameratrap/getDeployments");
      if (response.ok) {
        const data = await response.json();
        setDeployments(
          data.map((d) => ({ value: d._id, label: d.locationName }))
        );
      } else {
        console.error("Failed to fetch deployments");
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
    }
  };

  const fetchCamtrapImage = async (params = {}) => {
    const validParams = Object.entries(params).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (key === "reviewed" || key === "reviewedByUser") {
          acc[key] = value.toString();
        } else {
          acc[key] = value;
        }
      }
      return acc;
    }, {});

    const queryString = new URLSearchParams(validParams).toString();
    try {
      const response = await fetch(
        `/api/cameratrap/getCamtrapImage${queryString ? `?${queryString}` : ""}`
      );
      if (response.ok) {
        const image = await response.json();
        setCurrentImage(image);
      } else {
        console.error("Failed to fetch image");
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    }
  };

  const handleApplyFilters = (filters) => {
    fetchCamtrapImage(filters);
  };

  const handleNavigateImage = (direction) => {
    if (currentImage) {
      fetchCamtrapImage({ direction, currentImageId: currentImage._id });
    }
  };

  const fetchNextImage = async () => {
    if (currentImage) {
      await fetchCamtrapImage({
        direction: "next",
        currentImageId: currentImage._id,
      });
    } else {
      await fetchCamtrapImage();
    }
  };

  return (
    // <Grid style={{ height: "calc(100vh - 60px)" }}>
    <>
      <Grid>
        <GridCol
          span={{ base: 12, md: 6, lg: 7, xl: 6 }}
          style={{ height: "100%" }}
        >
          {/* <Paper
            shadow="xs"
            p="md"
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              // overflow: "hidden",
            }}
          > */}
          <Group spacing="xs" position="center" mb="md">
            <ButtonGroup>
              <Tooltip label="Previous Image">
                <Button
                  onClick={() => handleNavigateImage("previous")}
                  variant="default"
                  radius="md"
                  color="blue"
                >
                  <IconArrowLeft />
                </Button>
              </Tooltip>

              <Tooltip label="Next Image">
                <Button
                  onClick={() => handleNavigateImage("next")}
                  variant="default"
                  radius="md"
                  color="blue"
                >
                  <IconArrowRight />
                </Button>
              </Tooltip>
            </ButtonGroup>
            <ImageFilterControls
              onApplyFilters={handleApplyFilters}
              deployments={deployments}
            />
          </Group>

          {/* <ScrollArea style={{ flex: 1 }} offsetScrollbars> */}
          <ImageAnnotation fetchNextImage={fetchNextImage} />
          {/* </ScrollArea> */}
          {/* </Paper> */}
        </GridCol>

        <GridCol
          span={{ base: 12, md: 6, lg: 5, xl: 6 }}
          style={{ height: "100%" }}
        >
          <ScrollArea style={{ height: "100%" }} offsetScrollbars>
            {/* <Stack spacing="md"> */}
            <WildlifeSearch />
            {/* </Stack> */}
          </ScrollArea>
        </GridCol>
      </Grid>
    </>
  );
};

export default ImageAnnotationPage;
