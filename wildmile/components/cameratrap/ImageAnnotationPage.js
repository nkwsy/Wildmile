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
  Box,
  rem,
  Text,
} from "@mantine/core";
import { useImage, useTutorial, useReviewMode, useRelabeling, useImageLoaded, useIsFetching } from "./ContextCamera";
import { useUser } from "lib/hooks";
import { ImageAnnotation } from "./ImageAnnotation";
import { ObservationTally } from "./ObservationTally";
import { ImageFilterControls } from "./ImageFilterControls";
import WildlifeSearch from "./WildlifeSearch";
import { CameraTrapTutorial } from "./CameraTrapTutorial";
import { ReviewControls } from "./ReviewControls";
import { IconArrowLeft, IconArrowRight, IconHelp, IconEye, IconEdit } from "@tabler/icons-react";
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
  const [reviewMode, setReviewMode] = useReviewMode();
  const [isRelabeling, setRelabeling] = useRelabeling();
  const [, setImageLoaded] = useImageLoaded();
  const [isFetching, setIsFetching] = useIsFetching();

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
    let isMounted = true;
    const initializePage = async () => {
      setPageLoading(true);
      await fetchDeployments(); // Fetch deployments first
      const currentInitialFilters = await fetchFilterDefaults(); // Then fetch defaults

      if (!isMounted) return;
      setAppliedFilters(currentInitialFilters); // Set state after fetching

      if (initialImageId) {
        fetchCamtrapImage({ ...currentInitialFilters, selectedImageId: initialImageId });
      } else {
        fetchCamtrapImage({ ...currentInitialFilters, reviewMode: reviewMode });
      }
      setPageLoading(false);
    };
    initializePage();

    return () => {
      isMounted = false;
    };
    // Adding initialImageId and fetchFilterDefaults to dependencies.
  }, [initialImageId]); // Removed fetchFilterDefaults to prevent re-fetch

  const { user, loading: userLoading } = useUser();

  // Auto-start tutorial for first-time annotators or guest users.
  // A successful save sets the "wildmile.hasAnnotated" flag in localStorage
  // (see ObservationTally), so the tutorial only fires until the user completes one observation.
  useEffect(() => {
    if (typeof window === "undefined" || userLoading) return;

    // Wait for the page to load and an image to be present before auto-starting
    if (pageLoading || !currentImage) return;

    try {
      const hasAnnotated = window.localStorage.getItem("wildmile.hasAnnotated");

      if (!user) {
        // For guests, use sessionStorage so it only auto-launches once per session
        const sessionTutorialShown = window.sessionStorage.getItem("wildmile.sessionTutorialShown");
        if (!sessionTutorialShown) {
          setRunTutorial((prev) => (prev === 0 ? 1 : prev));
          window.sessionStorage.setItem("wildmile.sessionTutorialShown", "true");
        }
      } else if (!hasAnnotated) {
        // For logged in users who haven't annotated, always auto-launch until they do
        setRunTutorial((prev) => (prev === 0 ? 1 : prev));
      }
    } catch (e) {
      // localStorage/sessionStorage may be unavailable (private mode); fail silently.
    }
  }, [setRunTutorial, pageLoading, currentImage, user, userLoading]);

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
    setIsFetching(true);
    let processedParams = { reviewMode, ...params }; // Clone to avoid modifying the state directly

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
        // Pre-load the image before updating currentImage state to prevent flicker
        if (image.publicURL) {
          await new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
              image.naturalWidth = img.naturalWidth;
              image.naturalHeight = img.naturalHeight;
              resolve();
            };
            img.onerror = () => resolve(); // Resolve even on error to prevent blocking UI
            img.src = image.publicURL;
          });
        }
        setCurrentImage(image);
      } else {
        if (response.status === 404) {
          console.log("No more images found.");
          setCurrentImage(null);
        } else {
          console.error(`Failed to fetch image: ${response.status} ${response.statusText}`);
        }
        // If fetch fails (e.g. 404 No more images), and we are in reviewMode, maybe try without direction or just notify
        if (processedParams.direction === "next" || processedParams.direction === "previous") {
           // Try fetching a random one if next/prev fails
           await fetchCamtrapImage({ ...appliedFilters, reviewMode: processedParams.reviewMode });
        }
      }
    } catch (error) {
      console.error("Error fetching image:", error);
    } finally {
      setIsFetching(false);
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
        style={{ flex: 1, margin: 0, padding: "2px" }}
        gutter={4}
      >
        <GridCol
          span={{ base: 12, md: 8, lg: 8 }}
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
          h={{ base: "auto", md: "calc(100vh - 70px)" }}
        >
          <Paper withBorder p="sm" radius="md" style={{ flex: "1 1 auto", display: "flex", flexDirection: "column", minHeight: 0 }}>
            {!reviewMode && (
              <Group
                id="main-navigation-bar"
                gap={4}
                justify="center"
                mb={4}
                wrap="nowrap"
                style={{ width: "100%" }}
              >
                <Tooltip
                  label="Previous Image"
                  withinPortal
                  portalProps={{ zIndex: 1000000 }}
                >
                  <Button
                    id="prev-image-button"
                    onClick={() => handleNavigateImage("previous")}
                    variant="default"
                    radius="md"
                    size="sm"
                    loading={isFetching}
                    leftSection={<IconArrowLeft size={rem(18)} />}
                    px={8}
                    style={{
                      flex: "1 1 0",
                      minWidth: rem(36),
                      maxWidth: rem(100),
                      height: rem(36),
                      overflow: "hidden",
                    }}
                    styles={{
                        inner: {
                          justifyContent: 'center',
                          width: '100%',
                        },
                        section: {
                          // Keep a clean zero-margin baseline
                          marginRight: 0,
                          marginLeft: 0,
                        },
                        label: {
                          // If the label is empty (text hidden), hide it completely so it loses its width
                          display: 'inline-flex',
                          alignItems: 'center',
                          // This css pseudo-selector targets the label when it has no text content
                          ':empty': {
                            display: 'none',
                          }
                        }
                      }}
                    >
                    <Text
                      span
                      visibleFrom="xs"
                      pl={4}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Prev
                    </Text>
                  </Button>
                </Tooltip>

                <Tooltip
                  label="Next Image"
                  withinPortal
                  portalProps={{ zIndex: 1000000 }}
                >
                  <Button
                    id="next-image-button"
                    onClick={() => handleNavigateImage("next")}
                    variant="default"
                    radius="md"
                    size="sm"
                    loading={isFetching}
                    rightSection={<IconArrowRight size={rem(18)} />}
                    px={8}
                    style={{
                      flex: "1 1 0",
                      minWidth: rem(36),
                      maxWidth: rem(100),
                      height: rem(36),
                      overflow: "hidden",
                    }}
                    styles={{
                        inner: {
                          justifyContent: 'center',
                          width: '100%',
                        },
                        section: {
                          // Keep a clean zero-margin baseline
                          marginRight: 0,
                          marginLeft: 0,
                        },
                        label: {
                          // If the label is empty (text hidden), hide it completely so it loses its width
                          display: 'inline-flex',
                          alignItems: 'center',
                          // This css pseudo-selector targets the label when it has no text content
                          ':empty': {
                            display: 'none',
                          }
                        }
                      }}
                    >                    <Text
                      span
                      visibleFrom="xs"
                      pr={4}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Next
                    </Text>
                  </Button>
                </Tooltip>

                <ImageFilterControls
                  initialFilters={appliedFilters}
                  onApplyFilters={handleApplyFilters}
                  onJumpToEarliest={handleJumpToEarliest}
                  deployments={deployments}
                  setRunTutorial={setRunTutorial}
                />

                <Tooltip
                  label="Review Mode"
                  withinPortal
                  portalProps={{ zIndex: 1000000 }}
                >
                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    id="review-mode-toggle"
                    leftSection={<IconEye size={rem(18)} />}
                    onClick={() => {
                      setReviewMode(true);
                      setRelabeling(false);
                      fetchCamtrapImage({
                        ...appliedFilters,
                        reviewMode: true,
                      });
                    }}
                    px={8}
                    style={{
                      flex: "1 1 0",
                      minWidth: rem(36),
                      maxWidth: rem(110),
                      height: rem(36),
                      overflow: "hidden",
                    }}
                    styles={{
                        inner: {
                          justifyContent: 'center',
                          width: '100%',
                        },
                        section: {
                          // Keep a clean zero-margin baseline
                          marginRight: 0,
                          marginLeft: 0,
                        },
                        label: {
                          // If the label is empty (text hidden), hide it completely so it loses its width
                          display: 'inline-flex',
                          alignItems: 'center',
                          // This css pseudo-selector targets the label when it has no text content
                          ':empty': {
                            display: 'none',
                          }
                        }
                      }}
                    >                    <Text
                      span
                      visibleFrom="xs"
                      pl={4}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Review
                    </Text>
                  </Button>
                </Tooltip>

                <Tooltip
                  label="Tutorial Help"
                  withinPortal
                  portalProps={{ zIndex: 1000000 }}
                >
                  <Button
                    id="help-button"
                    size="sm"
                    color="green"
                    variant="outline"
                    leftSection={<IconHelp size={rem(18)} />}
                    onClick={() => setRunTutorial((prev) => prev + 1)}
                    px={8}
                    style={{
                      flex: "1 1 0",
                      minWidth: rem(36),
                      maxWidth: rem(110),
                      height: rem(36),
                      overflow: "hidden",
                    }}
                    styles={{
                        inner: {
                          justifyContent: 'center',
                          width: '100%',
                        },
                        section: {
                          // Keep a clean zero-margin baseline
                          marginRight: 0,
                          marginLeft: 0,
                        },
                        label: {
                          // If the label is empty (text hidden), hide it completely so it loses its width
                          display: 'inline-flex',
                          alignItems: 'center',
                          // This css pseudo-selector targets the label when it has no text content
                          ':empty': {
                            display: 'none',
                          }
                        }
                      }}
                    >                    <Text
                      span
                      visibleFrom="xs"
                      pl={4}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Help
                    </Text>
                  </Button>
                </Tooltip>
              </Group>
            )}
            {reviewMode && (
              <Group justify="center" mb={4} wrap="nowrap">
                {isRelabeling ? (
                  <Button
                    variant="light"
                    color="blue"
                    size="sm"
                    leftSection={<IconEye size={rem(18)} />}
                    onClick={() => setRelabeling(false)}
                    style={{
                      flex: "1 1 auto",
                      minWidth: rem(36),
                      maxWidth: rem(200),
                      height: rem(36),
                      overflow: "hidden",
                    }}
                  >
                    <Text
                      span
                      visibleFrom="xs"
                      ml={4}
                      style={{
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Back to Review
                    </Text>
                  </Button>
                ) : (
                  <Group
                    gap={4}
                    wrap="nowrap"
                    style={{ width: "100%", justifyContent: "center" }}
                  >
                    <Button
                      variant="subtle"
                      color="gray"
                      size="sm"
                      leftSection={<IconEdit size={rem(18)} />}
                      onClick={(e) => {
                        e.preventDefault();
                        setReviewMode(false);
                        setRelabeling(false);
                      }}
                      style={{
                        flex: "1 1 auto",
                        minWidth: rem(36),
                        maxWidth: rem(200),
                        height: rem(36),
                        overflow: "hidden",
                      }}
                    >
                      <Text
                        span
                        // visibleFrom="xs"
                        ml={4}
                        style={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        Exit Review Mode
                      </Text>
                    </Button>
                  </Group>
                )}
              </Group>
            )}
            <div style={{ flex: 1, minHeight: 0 }}>
              <ImageAnnotation filters={appliedFilters} />
            </div>
          </Paper>
        </GridCol>

        <GridCol
          span={{ base: 12, md: 4, lg: 4 }}
          style={{
            height: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
          mah={{ md: "calc(100vh - 70px)" }}
        >
          <div
            style={{
              flex: "0 1 auto",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              minHeight: 0,
            }}
          >
            {reviewMode && !isRelabeling ? (
              <ReviewControls fetchNextImage={fetchNextImage} />
            ) : (
              <>
                <div
                  style={{
                    flex: 1,
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <WildlifeSearch />
                </div>
                <ObservationTally fetchNextImage={fetchNextImage} />
              </>
            )}
          </div>
        </GridCol>
      </Grid>
    </div>
  );
};

export default ImageAnnotationPage;
