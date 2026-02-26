"use client";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Group,
  LoadingOverlay,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Modal,
  ScrollArea,
  Pagination,
} from "@mantine/core";
import { useDebouncedCallback, useDisclosure } from "@mantine/hooks";
import classes from "styles/ExploreWildlife.module.css";
import { GalleryFilter } from "components/cameratrap/images/GalleryFilter";
import { IdentificationProvider } from "components/cameratrap/ContextCamera";
import { ImageGallery } from "components/cameratrap/images/ImageGallery";
import { DeploymentMapProvider } from "components/cameratrap/deployments/DeploymentMapContext";

const ITEMS_PER_PAGE = 20;

// --- URL <-> Filter Serialization Helpers ---
// These keys are stored as "true"/"false" strings in the URL but
// need to be actual booleans in the filter state.
const BOOLEAN_KEYS = [
  "reviewed",
  "reviewedByUser",
  "userFavorite",
  "favorites",
  "accepted",
  "needsReview",
];

// Date keys need special handling: stored as ISO strings in URL,
// converted to Date objects for the DateInput components.
const DATE_KEYS = ["startDate", "endDate"];

/**
 * Parse URL search params into a filter object that the filter
 * components understand. Handles type coercion for booleans, dates,
 * and comma-separated arrays (species).
 */
function parseFiltersFromParams(searchParams) {
  const filters = {};
  for (const [key, value] of searchParams.entries()) {
    // Skip pagination params — handled separately
    if (key === "page" || key === "limit") continue;

    if (BOOLEAN_KEYS.includes(key)) {
      // "true" -> true, "false" -> false
      filters[key] = value === "true";
    } else if (DATE_KEYS.includes(key)) {
      // ISO string -> Date object for Mantine DateInput
      const parsed = new Date(value);
      filters[key] = isNaN(parsed.getTime()) ? null : parsed;
    } else if (key === "species") {
      // Comma-separated list -> array: "Deer,Raccoon" -> ["Deer","Raccoon"]
      filters[key] = value.split(",").filter(Boolean);
    } else {
      filters[key] = value;
    }
  }
  return filters;
}

/**
 * Convert a filter object + page number into URLSearchParams.
 * Skips null/undefined/empty values so the URL stays clean.
 * Dates are serialized as ISO strings, arrays as comma-separated.
 */
function filtersToParams(filters, page) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(filters)) {
    // Skip empty/null values to keep URL clean
    if (value === null || value === undefined || value === "") continue;

    if (Array.isArray(value)) {
      // Only include non-empty arrays
      if (value.length > 0) params.set(key, value.join(","));
    } else if (value instanceof Date) {
      // Serialize dates as ISO strings for URL portability
      params.set(key, value.toISOString());
    } else {
      params.set(key, String(value));
    }
  }

  // Only include page in URL when it's not the first page
  if (page > 1) params.set("page", String(page));

  return params;
}

/**
 * Inner component that uses useSearchParams (requires Suspense boundary).
 * Manages the two-way sync between filter state and URL params.
 */
function ExploreContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // --- Initialize state from URL on first render ---
  // This lets users bookmark/share filtered views and have them restore.
  const initialFilters = parseFiltersFromParams(searchParams);
  const initialPage = parseInt(searchParams.get("page") || "1", 10);

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [currentFilters, setCurrentFilters] = useState(initialFilters);

  /**
   * Update the browser URL to reflect the current filter + page state.
   * Uses router.replace (not push) so that each filter tweak doesn't
   * create a new browser history entry — the back button stays usable.
   * Debounced to 500ms so rapid filter changes don't thrash the URL.
   */
  const updateUrl = useDebouncedCallback((filters, pg) => {
    const params = filtersToParams(filters, pg);
    const queryString = params.toString();
    router.replace(`${pathname}${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, 500);

  /**
   * Fetch images from the API with the given filters and page.
   * The API expects all filters as flat query params.
   */
  const fetchImages = async (filters = {}, pg = 1) => {
    setLoading(true);
    try {
      // Build API query params from the filter object
      const apiParams = new URLSearchParams();
      for (const [key, value] of Object.entries(filters)) {
        if (value === null || value === undefined || value === "") continue;
        if (value instanceof Date) {
          apiParams.set(key, value.toISOString());
        } else if (Array.isArray(value)) {
          if (value.length > 0) apiParams.set(key, value.join(","));
        } else {
          apiParams.set(key, String(value));
        }
      }
      apiParams.set("page", String(pg));
      apiParams.set("limit", String(ITEMS_PER_PAGE));

      const response = await fetch(
        `/api/cameratrap/getCameratrapImages?${apiParams}`
      );
      const data = await response.json();
      setImages(data.images);
      setTotalImages(data.totalImages);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch images + update URL whenever filters or page change.
  // Both are kept in sync here so there's a single source of truth.
  useEffect(() => {
    fetchImages(currentFilters, page);
    updateUrl(currentFilters, page);
  }, [page, currentFilters]);

  /**
   * Called by GalleryFilter when the user changes any filter.
   * Resets to page 1 (changing filters invalidates the current page)
   * and stores the new filters.
   */
  const handleFilterChange = (filters) => {
    setPage(1);
    setCurrentFilters(filters);
  };

  return (
    <Container fluid size="xl" py="xl">
      <Title order={1} mb="xl">
        Explore Wildlife
      </Title>
      <Grid>
        <Grid.Col
          span={{ base: 12, md: 6, lg: 5, xl: 3 }}
          style={{ height: "100%" }}
        >
          <ScrollArea style={{ height: "100%" }} offsetScrollbars>
            <Paper p="md" mb="xl">
              {/* Pass initialFilters so the filter controls can
                  hydrate their state from the URL on first render */}
              <GalleryFilter
                onFilterChange={handleFilterChange}
                initialFilters={initialFilters}
              />
            </Paper>
          </ScrollArea>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 7 }}>
          <ImageGallery
            images={images}
            totalImages={totalImages}
            totalPages={totalPages}
            page={page}
            setPage={setPage}
            loading={loading}
            emptyMessage="No images found"
            onPageChange={setPage}
          />
        </Grid.Col>
      </Grid>
    </Container>
  );
}

/**
 * Page wrapper with Suspense boundary.
 * useSearchParams() requires a Suspense boundary in Next.js App Router
 * to avoid de-opting the entire page from static rendering.
 */
export default function Page() {
  return (
    <Suspense fallback={<LoadingOverlay visible />}>
      <IdentificationProvider>
        <DeploymentMapProvider>
          <ExploreContent />
        </DeploymentMapProvider>
      </IdentificationProvider>
    </Suspense>
  );
}
