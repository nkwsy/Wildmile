"use client";
import { AdvancedImageFilterControls } from "../AdvancedImageFilterControls";
import { Button, Group, Drawer, Stack, Collapse } from "@mantine/core";
import {
  IconRefresh,
  IconAdjustmentsHorizontal,
  IconPaw,
} from "@tabler/icons-react";
import { useEffect, useState, useRef } from "react";
import { useDisclosure } from "@mantine/hooks";
import WildlifeSearch from "../WildlifeSearch";
import { useSelection } from "../ContextCamera";

/**
 * GalleryFilter wraps the AdvancedImageFilterControls and WildlifeSearch
 * into a single sidebar panel for the explore page.
 *
 * @param {Function} onFilterChange - called with the final validated filter object
 * @param {Object}   initialFilters - filter values parsed from URL params,
 *                    used to hydrate the filter controls on first render so
 *                    bookmarked/shared URLs restore the correct filter state.
 */
export function GalleryFilter({ onFilterChange, initialFilters = {} }) {
  const [opened, { toggle }] = useDisclosure(true);
  const [selection, setSelection] = useSelection();
  const [filters, setFilters] = useState({});
  const [minimized, { toggle: toggleMinimized }] = useDisclosure(true);

  // Tracks whether the selection useEffect has fired after initial mount.
  // On the very first render, `selection` is [] (empty) because the context
  // starts empty. We need to skip that first effect so we don't wipe out
  // species that were restored from URL params.
  const isInitialMount = useRef(true);

  /**
   * Called by AdvancedImageFilterControls whenever any filter changes.
   * Merges in the current WildlifeSearch species selection (if any),
   * strips out null/empty values, and passes the result up to the page.
   *
   * Species handling:
   * - If the user has selected species in WildlifeSearch (selection.length > 0),
   *   those override whatever species are in the incoming filters.
   * - If selection is empty, we preserve whatever species are already in the
   *   incoming filters (e.g. species restored from URL params on initial load,
   *   or an empty array after the user cleared them).
   */
  const handleApplyFilters = (incomingFilters) => {
    if (selection.length > 0) {
      // WildlifeSearch has active selections — use those species names
      incomingFilters.species = selection.map((animal) => animal.name);
    }
    // When selection is empty, don't touch incomingFilters.species.
    // This preserves URL-restored species on initial load, and also
    // preserves an empty array when the user explicitly cleared species
    // (via the selection useEffect below or "Clear All Filters").

    // Strip out null/undefined/empty values so the URL stays clean
    // and the API doesn't receive meaningless params.
    const validParams = Object.entries(incomingFilters).reduce(
      (acc, [key, value]) => {
        if (value !== null && value !== undefined && value !== "") {
          if (key === "reviewed" || key === "reviewedByUser") {
            acc[key] = value.toString();
          } else {
            acc[key] = value;
          }
        }
        return acc;
      },
      {}
    );
    onFilterChange(validParams);
    setFilters(validParams);
  };

  // Re-apply filters when the wildlife species selection changes.
  // SKIPS the initial mount so URL-provided species aren't wiped out
  // by the empty initial selection context.
  // After initial mount, every selection change (including deselecting
  // all species back to []) explicitly sets species from the selection,
  // so the user's intent to clear is respected.
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // User changed species via WildlifeSearch — build updated filters
    // with the current selection (which may be empty if they deselected all)
    const updatedFilters = {
      ...filters,
      species: selection.map((animal) => animal.name),
    };
    handleApplyFilters(updatedFilters);
  }, [selection]);

  const handleClearFilters = () => {
    setSelection([]);
  };

  return (
    <>
      <Group justify="flex-start" mb={5}>
        <Button.Group>
          <Button
            onClick={toggle}
            variant="outline"
            color="yellow"
            leftSection={<IconPaw size={16} />}
          >
            {opened ? "Hide Wildlife" : "Show Wildlife"}
          </Button>

          <Button
            onClick={toggleMinimized}
            variant="outline"
            color="yellow"
            leftSection={<IconAdjustmentsHorizontal size={16} />}
          >
            {minimized ? "Hide Filters" : "Show Filters"}
          </Button>
        </Button.Group>
      </Group>

      {/* Pass initialFilters through so AdvancedImageFilterControls
          can hydrate its internal state from URL params on first render */}
      <AdvancedImageFilterControls
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
        onMinimize={minimized}
        initialFilters={initialFilters}
      />

      <Collapse in={opened}>
        <WildlifeSearch />
      </Collapse>
    </>
  );
}
