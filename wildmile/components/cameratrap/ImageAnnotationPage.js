"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Button,
  Group,
  Tooltip,
  Grid,
  GridCol,
  LoadingOverlay,
} from "@mantine/core";
import { useImage, useTutorial } from "./ContextCamera";
import { ImageAnnotation } from "./ImageAnnotation";
import { ObservationTally } from "./ObservationTally";
import { ImageFilterControls } from "./ImageFilterControls";
import WildlifeSearch from "./WildlifeSearch";
import { CameraTrapTutorial } from "./CameraTrapTutorial";
import { warmImageCache } from "./imageUrls";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import classes from "styles/cameraTrapLayout.module.css";

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

// A prefetched media document older than this is re-fetched live before it is
// shown (its pixels are already cached, so that costs one small request).
// Keeps comments / consensus / review state from other volunteers reasonably
// fresh while a user lingers on one image.
const PREFETCH_TTL_MS = 60 * 1000;

/** Build the query string for /api/cameratrap/getCamtrapImage. */
function buildImageQuery(params = {}) {
  const processedParams = { ...params }; // Clone to avoid modifying the state directly

  // Convert animalProbability array to comma-separated string
  if (
    Array.isArray(processedParams.animalProbability) &&
    processedParams.animalProbability.length === 2
  ) {
    processedParams.animalProbability =
      processedParams.animalProbability.join(",");
  }

  const booleanKeys = ["reviewed", "reviewedByUser", "notReviewedByUser"];
  const validParams = Object.entries(processedParams).reduce(
    (acc, [key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        acc[key] = booleanKeys.includes(key) ? value.toString() : value;
      }
      return acc;
    },
    {},
  );

  return new URLSearchParams(validParams).toString();
}

/** Fetch a single image. Resolves to the image document, or null on 404/error. */
async function requestImage(params = {}) {
  const queryString = buildImageQuery(params);
  try {
    const response = await fetch(
      `/api/cameratrap/getCamtrapImage${queryString ? `?${queryString}` : ""}`,
    );
    if (response.ok) {
      return await response.json();
    }
    console.error("Failed to fetch image");
    return null;
  } catch (error) {
    console.error("Error fetching image:", error);
    return null;
  }
}

/** Stable identity for a filter set, so a prefetch can be matched to the filters it was made for. */
function filtersKey(filters) {
  return JSON.stringify(filters);
}

export const ImageAnnotationPage = ({ initialImageId }) => {
  const [currentImage, setCurrentImage] = useImage();
  const [deployments, setDeployments] = useState([]);
  // Initialize with client-side defaults, will be overwritten by fetched defaults
  const [appliedFilters, setAppliedFilters] = useState(clientSideDefaultFilters);
  const [pageLoading, setPageLoading] = useState(true); // To manage loading state of defaults and initial image
  const [runTutorial, setRunTutorial] = useTutorial();

  // The image that follows `currentImage` under `appliedFilters`, requested as
  // soon as the current image is shown so that "save → next" is instant.
  // Shape: { key, promise: Promise<image|null>, cancelled, createdAt }.
  const nextImageRef = useRef(null);
  // filtersKey() of the filters the current image was obtained under. The
  // prefetch only runs when this matches `appliedFilters`, so changing filters
  // doesn't prefetch "next after the old image" while the new image is loading.
  const loadedFiltersKeyRef = useRef(null);
  const currentImageId = currentImage?._id ?? null;

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

  /**
   * Fetch an image and make it the current one. `filters` is the filter set the
   * request was made under (used to decide whether prefetching is valid).
   * Resolves to the image or null.
   */
  const fetchCamtrapImage = useCallback(
    async (params = {}, filters = null) => {
      const image = await requestImage(params);
      if (image) {
        loadedFiltersKeyRef.current = filters ? filtersKey(filters) : null;
        setCurrentImage(image);
      }
      return image;
    },
    [setCurrentImage],
  );

  // Effect for initializing page: fetch deployments, then defaults, then initial image
  useEffect(() => {
    const initializePage = async () => {
      setPageLoading(true);
      await fetchDeployments(); // Fetch deployments first
      const currentInitialFilters = await fetchFilterDefaults(); // Then fetch defaults
      setAppliedFilters(currentInitialFilters); // Set state after fetching

      if (initialImageId) {
        fetchCamtrapImage({ selectedImageId: initialImageId }, currentInitialFilters);
      } else {
        fetchCamtrapImage(currentInitialFilters, currentInitialFilters);
      }
      setPageLoading(false);
    };
    initializePage();
    // Adding initialImageId and fetchFilterDefaults to dependencies.
  }, [initialImageId, fetchFilterDefaults, fetchCamtrapImage]); // Removed fetchDeployments from here as it's stable and not in useCallback

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

  // Prefetch the next image (metadata + pixels) while the user works on the
  // current one. Re-armed whenever the current image or the filters change.
  useEffect(() => {
    if (!currentImageId) {
      nextImageRef.current = null;
      return undefined;
    }
    const key = `${currentImageId}|${filtersKey(appliedFilters)}`;

    // Filters changed but the image shown is still the one loaded under the
    // old filters: a live fetch is in flight and will re-run this effect.
    if (loadedFiltersKeyRef.current !== filtersKey(appliedFilters)) {
      nextImageRef.current = null;
      return undefined;
    }

    // Same image + filters (e.g. React StrictMode re-running the effect):
    // keep the in-flight request, just re-arm it.
    const existing = nextImageRef.current;
    if (existing?.key === key) {
      existing.cancelled = false;
      return () => {
        existing.cancelled = true;
      };
    }

    const entry = { key, cancelled: false, promise: null, createdAt: Date.now() };
    entry.promise = requestImage({
      ...appliedFilters,
      direction: "next",
      currentImageId,
    }).then((image) => {
      // Only warm the browser cache if this prefetch is still the relevant one.
      if (image && !entry.cancelled) warmImageCache(image);
      return image;
    });
    nextImageRef.current = entry;

    return () => {
      entry.cancelled = true;
    };
  }, [currentImageId, appliedFilters]);

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

  const handleApplyFilters = (filters) => {
    setAppliedFilters(filters);
    fetchCamtrapImage(filters, filters);
  };

  const handleJumpToEarliest = (filters) => {
    setAppliedFilters(filters);
    fetchCamtrapImage({ ...filters, direction: "oldest" }, filters);
  };

  /**
   * Advance to the next image. Uses the prefetched result when it matches the
   * current image + filters and is fresh (the normal case after a save),
   * otherwise falls back to a live request.
   */
  const fetchNextImage = useCallback(async () => {
    if (!currentImageId) {
      return fetchCamtrapImage(appliedFilters, appliedFilters);
    }

    const key = `${currentImageId}|${filtersKey(appliedFilters)}`;
    const entry = nextImageRef.current;
    if (entry?.key === key && Date.now() - entry.createdAt < PREFETCH_TTL_MS) {
      const image = await entry.promise;
      if (image) {
        loadedFiltersKeyRef.current = filtersKey(appliedFilters);
        setCurrentImage(image);
        return image;
      }
      // The prefetch found nothing (end of the sequence) or failed: try live.
    }

    return fetchCamtrapImage(
      { ...appliedFilters, direction: "next", currentImageId },
      appliedFilters,
    );
  }, [currentImageId, appliedFilters, fetchCamtrapImage, setCurrentImage]);

  const handleNavigateImage = (direction) => {
    if (!currentImageId) return;
    if (direction === "next") {
      fetchNextImage();
      return;
    }
    fetchCamtrapImage(
      { ...appliedFilters, direction, currentImageId },
      appliedFilters,
    );
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
