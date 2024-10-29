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
} from "@mantine/core";
import { useImage } from "./ContextCamera";
import { ImageAnnotation } from "./ImageAnnotation";
import { ImageFilterControls } from "./ImageFilterControls";
import WildlifeSearch from "./WildlifeSearch";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";

export const ImageAnnotationPage = () => {
  const [currentImage, setCurrentImage] = useImage();
  const [deployments, setDeployments] = useState([]);

  useEffect(() => {
    fetchDeployments();
  }, []);

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
    <Group align="flex-start" spacing="xl">
      <Paper shadow="xs" p="xl" style={{ flex: 1 }}>
        <Stack spacing="md">
          <ImageFilterControls
            onApplyFilters={handleApplyFilters}
            deployments={deployments}
          />
          <Group spacing="xs" position="center" mt="md">
            <ButtonGroup>
              <Tooltip label="Previous Image">
                <Button
                  onClick={() => handleNavigateImage("previous")}
                  variant="default"
                  // size="xl"
                  radius="md"
                  color="blue"
                  // disabled={isSaving}
                >
                  <IconArrowLeft />
                </Button>
              </Tooltip>

              <Tooltip label="Next Image">
                <Button
                  onClick={() => handleNavigateImage("next")}
                  variant="default"
                  // size="xl"
                  radius="md"
                  color="blue"
                  // disabled={isSaving}
                >
                  <IconArrowRight />
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Group>
          <ImageAnnotation fetchNextImage={fetchNextImage} />
        </Stack>
      </Paper>

      <Stack spacing="xl" style={{ flex: 1 }}>
        <WildlifeSearch />
      </Stack>
    </Group>
  );
};

export default ImageAnnotationPage;
