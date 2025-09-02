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
import { useCallback } from "react"; // Added for useCallback
import { LoadingOverlay } from "@mantine/core"; // For page loading state

// This can serve as a fallback if API fails or for structure reference
// Also used to structure the fetched defaults.
const clientSideDefaultFilters = {
  locationId: null,
  startDate: null,
  endDate: null,
  startTime: "", // Match API and admin form
  endTime: "",   // Match API and admin form
  reviewed: false,
  reviewedByUser: false,
  animalProbability: [0.75, 1.0],
};

export const ImageAnnotationPage = ({ initialImageId }) => {
  const [currentImage, setCurrentImage] = useImage();
  const [deployments, setDeployments] = useState([]);
  // Initialize with client-side defaults, will be overwritten by fetched defaults
  const [appliedFilters, setAppliedFilters] = useState(clientSideDefaultFilters);
  const [pageLoading, setPageLoading] = useState(true); // To manage loading state of defaults and initial image

  const fetchFilterDefaults = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/filter-defaults");
      if (response.ok) {
        const serverDefaults = await response.json();
        // Ensure dates are Date objects and animalProbability is valid, and merge with clientSideStructure
        const processedDefaults = {
          ...clientSideDefaultFilters, // Start with base structure for safety
          ...serverDefaults,       // Override with server values
          startDate: serverDefaults.startDate ? new Date(serverDefaults.startDate) : null,
          endDate: serverDefaults.endDate ? new Date(serverDefaults.endDate) : null,
          animalProbability: Array.isArray(serverDefaults.animalProbability) && serverDefaults.animalProbability.length === 2
                               ? serverDefaults.animalProbability
                               : clientSideDefaultFilters.animalProbability,
          startTime: serverDefaults.startTime || "", // Ensure string, default to empty
          endTime: serverDefaults.endTime || "",     // Ensure string, default to empty
        };
        // Not setting appliedFilters here directly, returning it to the caller in useEffect
        return processedDefaults;
      } else {
        console.warn("Failed to fetch filter defaults, using client-side defaults.");
        return clientSideDefaultFilters;
      }
    } catch (error) {
      console.error("Error fetching filter defaults:", error);
      return clientSideDefaultFilters; // Fallback on error
    }
  }, []);

  // Effect for initializing page: fetch deployments, then defaults, then initial image
  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      await fetchDeployments(); // Fetch deployments first
      const currentInitialFilters = await fetchFilterDefaults(); // Then fetch defaults
      setAppliedFilters(currentInitialFilters); // Set state after fetching

      if (initialImageId) {
        fetchCamtrapImage({ ...currentInitialFilters, selectedImageId: initialImageId });
      } else {
        fetchCamtrapImage(currentInitialFilters);
      }
      setPageLoading(false);
    };
    initializePage();
    // Adding initialImageId and fetchFilterDefaults to dependencies.
  }, [initialImageId, fetchFilterDefaults]); // Removed fetchDeployments from here as it's stable and not in useCallback

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
    let processedParams = { ...params }; // Clone to avoid modifying the state directly

    // Convert animalProbability array to comma-separated string
    if (processedParams.animalProbability && Array.isArray(processedParams.animalProbability) && processedParams.animalProbability.length === 2) {
      processedParams.animalProbability = processedParams.animalProbability.join(',');
    }

    const validParams = Object.entries(processedParams).reduce((acc, [key, value]) => {
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
    setAppliedFilters(filters);
    fetchCamtrapImage(filters);
  };

  const handleNavigateImage = (direction) => {
    if (currentImage) {
      fetchCamtrapImage({
        ...appliedFilters,
        direction,
        currentImageId: currentImage._id,
      });
    }
  };

  const fetchNextImage = async () => {
    if (currentImage) {
      await fetchCamtrapImage({
        ...appliedFilters,
        direction: "next",
        currentImageId: currentImage._id,
      });
    } else {
      await fetchCamtrapImage(appliedFilters);
    }
  };

  return (
    // <Grid style={{ height: "calc(100vh - 60px)" }}>
    <>
      <LoadingOverlay visible={pageLoading} overlayProps={{ blur: 2 }} />
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
              initialFilters={appliedFilters} // Pass the loaded (potentially default) filters
              onApplyFilters={handleApplyFilters}
              deployments={deployments}
            />
          </Group>

          {/* <ScrollArea style={{ flex: 1 }} offsetScrollbars> */}
          <ImageAnnotation
            fetchNextImage={fetchNextImage}
            filters={appliedFilters} // This remains the source of truth for annotations/API calls
          />
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
