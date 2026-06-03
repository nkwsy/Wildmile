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
  Grid,
  GridCol,
  ScrollArea,
} from "@mantine/core";
import { useImage, useTutorial } from "./ContextCamera";
import { ImageAnnotation } from "./ImageAnnotation";
import { ObservationTally } from "./ObservationTally";
import { ImageFilterControls } from "./ImageFilterControls";
import WildlifeSearch from "./WildlifeSearch";
import { CameraTrapTutorial } from "./CameraTrapTutorial";
import { IconArrowLeft, IconArrowRight, IconHelp } from "@tabler/icons-react";
import classes from "styles/cameraTrapLayout.module.css";
import { useCallback } from "react"; // Added for useCallback
import { LoadingOverlay } from "@mantine/core"; // For page loading state

// This can serve as a fallback if API fails or for structure reference
// Also used to structure the fetched defaults.
const clientSideDefaultFilters = {
  locationId: null,
  startDate: null,
  endDate: null,
  startTime: "",
  endTime: "",
  reviewed: false,
  reviewedByUser: false,
  notReviewedByUser: false,
  animalProbability: [0.75, 1.0],
};

export const ImageAnnotationPage = ({ initialImageId }) => {
  const [currentImage, setCurrentImage] = useImage();
  const [deployments, setDeployments] = useState([]);
  // Initialize with client-side defaults, will be overwritten by fetched defaults
  const [appliedFilters, setAppliedFilters] = useState(clientSideDefaultFilters);
  const [pageLoading, setPageLoading] = useState(true); // To manage loading state of defaults and initial image
  const [runTutorial, setRunTutorial] = useTutorial();

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
        fetchCamtrapImage({ selectedImageId: initialImageId });
      } else {
        fetchCamtrapImage(currentInitialFilters);
      }
      setPageLoading(false);
    };
    initializePage();
    // Adding initialImageId and fetchFilterDefaults to dependencies.
  }, [initialImageId, fetchFilterDefaults]); // Removed fetchDeployments from here as it's stable and not in useCallback

  // Auto-start tutorial for first-time annotators. A successful save sets the
  // "wildmile.hasAnnotated" flag in localStorage (see ObservationTally), so the
  // tutorial only fires until the user completes one observation.
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (!window.localStorage.getItem("wildmile.hasAnnotated")) {
        setRunTutorial((prev) => prev + 1);
      }
    } catch (e) {
      // localStorage may be unavailable (private mode); fail silently.
    }
  }, [setRunTutorial]);

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

    const booleanKeys = ["reviewed", "reviewedByUser", "notReviewedByUser"];
    const validParams = Object.entries(processedParams).reduce((acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        if (booleanKeys.includes(key)) {
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

  const handleJumpToEarliest = (filters) => {
    setAppliedFilters(filters);
    fetchCamtrapImage({ ...filters, direction: "oldest" });
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
    <div className={classes.fullViewport}>
      <CameraTrapTutorial />
      <LoadingOverlay visible={pageLoading && !runTutorial} overlayProps={{ blur: 2 }} />
      <Grid
        align="stretch"
        style={{ flex: 1, margin: 0, padding: "10px" }}
        gutter="md"
      >
        <GridCol
          span={{ base: 12, md: 8, lg: 8 }}
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Group id="main-navigation-bar" gap="xs" justify="center" mb="xs">
            <Button.Group id="image-navigation-controls">
              <Tooltip label="Previous Image">
                <Button
                  id="prev-image-button"
                  onClick={() => handleNavigateImage("previous")}
                  variant="default"
                  radius="md"
                >
                  <IconArrowLeft />
                </Button>
              </Tooltip>

              <Tooltip label="Next Image">
                <Button
                  id="next-image-button"
                  onClick={() => handleNavigateImage("next")}
                  variant="default"
                  radius="md"
                >
                  <IconArrowRight />
                </Button>
              </Tooltip>
            </Button.Group>
            <ImageFilterControls
              initialFilters={appliedFilters}
              onApplyFilters={handleApplyFilters}
              onJumpToEarliest={handleJumpToEarliest}
              deployments={deployments}
            />
          </Group>
          <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", gap: "var(--mantine-spacing-md)" }}>
            <div style={{ flex: 1, minHeight: 0 }}>
              <ImageAnnotation filters={appliedFilters} />
            </div>
            <ObservationTally fetchNextImage={fetchNextImage} />
          </div>
        </GridCol>

        <GridCol span={{ base: 12, md: 4, lg: 4 }} style={{ height: "calc(100vh - 100px)" }}>
          <WildlifeSearch />
        </GridCol>
      </Grid>
    </div>
  );
};

export default ImageAnnotationPage;
