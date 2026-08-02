"use client";

import React, { useState } from "react";
import {
  Paper,
  Text,
  Group,
  Button,
  Stack,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconX,
} from "@tabler/icons-react";
import {
  useImage,
  useReviewMode,
  useRelabeling,
  useSelection,
  useAnimalCounts,
  useObservationState,
  useImageLoaded,
  useIsFetching,
} from "./ContextCamera";

export const ReviewControls = ({ fetchNextImage }) => {
  const [currentImage] = useImage();
  const [reviewMode] = useReviewMode();
  const [imageLoaded] = useImageLoaded();
  const [isFetching] = useIsFetching();
  const [isRelabeling, setRelabeling] = useRelabeling();
  const [, setSelection] = useSelection();
  const [, setAnimalCounts] = useAnimalCounts();
  const [, setObsState] = useObservationState();
  const [isSaving, setIsSaving] = useState(false);

  if (!reviewMode) return null;
  if (isRelabeling) return null;

  const consensusItems = currentImage?.speciesConsensus || [];

  // Get blank count if it exists
  const blankItem = consensusItems.find((i) => i.observationType === "blank");
  const blankCount = blankItem ? blankItem.observationCount : 0;

  // Group by type and pick the winners
  const winners = [];
  let maxOtherCount = 0;

  // Handle animals: group by scientificName and pick winner for each unique species
  const animalItems = consensusItems.filter((i) => i.observationType === "animal");
  const animalGroups = {};
  animalItems.forEach((item) => {
    const key = item.scientificName;
    if (!animalGroups[key]) {
      animalGroups[key] = [];
    }
    animalGroups[key].push(item);
  });

  Object.values(animalGroups).forEach((group) => {
    // Sort by observationCount descending to pick the count most people agreed on for this species
    group.sort((a, b) => b.observationCount - a.observationCount);
    const winner = group[0];
    winners.push(winner);
    if (winner.observationCount > maxOtherCount) {
      maxOtherCount = winner.observationCount;
    }
  });

  // Handle human and vehicle: pick winner for each type
  ["human", "vehicle"].forEach((type) => {
    const itemsOfType = consensusItems.filter((i) => i.observationType === type);
    if (itemsOfType.length > 0) {
      itemsOfType.sort((a, b) => b.observationCount - a.observationCount);
      const winner = itemsOfType[0];
      winners.push(winner);
      if (winner.observationCount > maxOtherCount) {
        maxOtherCount = winner.observationCount;
      }
    }
  });

  // It's blank if blank has strictly more votes than any other single observation,
  // or if there are no other observations.
  const isBlank = blankCount > maxOtherCount || winners.length === 0;

  const summaryParts = winners
    .map((item) => {
      if (item.observationType === "animal") {
        const commonName = item.preferred_common_name || item.scientificName;
        const scientificName = item.preferred_common_name
          ? item.scientificName
          : null;
        return (
          <Stack gap={0} align="center" key={item.scientificName}>
            <Text fw={800} size="xl" c="blue">
              {item.count}x {commonName}
            </Text>
            {scientificName && (
              <Text size="xs" c="dimmed" fs="italic">
                {scientificName}
              </Text>
            )}
          </Stack>
        );
      }
      if (item.observationType === "human")
        return (
          <Text fw={800} size="xl" c="blue" key="human">
            Human
          </Text>
        );
      if (item.observationType === "vehicle")
        return (
          <Text fw={800} size="xl" c="blue" key="vehicle">
            Vehicle
          </Text>
        );
      return null;
    })
    .filter(Boolean);

  const handleConfirm = async () => {
    setIsSaving(true);
    let observations = [];

    if (isBlank) {
      observations.push({
        mediaId: currentImage.mediaID,
        mediaInfo: {
          md5: currentImage.mediaID,
          imageHash: currentImage.imageHash,
        },
        eventStart: currentImage.timestamp,
        eventEnd: currentImage.timestamp,
        observationLevel: "media",
        observationType: "blank",
      });
    } else {
      observations = winners.map((item) => ({
        mediaId: currentImage.mediaID,
        mediaInfo: {
          md5: currentImage.mediaID,
          imageHash: currentImage.imageHash,
        },
        taxonId: item.taxonID,
        scientificName: item.scientificName,
        count: item.count,
        eventStart: currentImage.timestamp,
        eventEnd: currentImage.timestamp,
        observationLevel: "media",
        observationType: item.observationType,
      }));
    }

    try {
      const response = await fetch("/api/cameratrap/saveObservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(observations),
      });

      if (response.ok) {
        setSelection([]);
        setAnimalCounts({});
        await fetchNextImage();
      } else {
        alert("Failed to confirm observations.");
      }
    } catch (error) {
      console.error("Error confirming observations:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRelabel = () => {
    if (isBlank) {
      setSelection([]);
      setAnimalCounts({});
      setObsState({
        humanPresent: false,
        vehiclePresent: false,
        noAnimalsVisible: true,
        comment: "",
      });
    } else {
      // Pre-fill selection and counts for relabeling using the "winners"
      const animalWinners = winners.filter(
        (i) => i.observationType === "animal"
      );

      const initialSelection = animalWinners.map((i) => {
        const numericId = Number(i.taxonID);
        const tId = !isNaN(numericId) ? numericId : null;
        const animalId = tId || i.scientificName;
        return {
          taxonId: tId,
          id: animalId, // For double compatibility
          name: i.scientificName,
          scientificName: i.scientificName,
          preferred_common_name: i.preferred_common_name || i.scientificName,
          default_photo: i.default_photo,
          rank: i.rank,
          iconic_taxon_name: i.iconic_taxon_name,
          wikipedia_url: i.wikipedia_url,
          // Add fields for SpeciesCards formatting compatibility
          commonName: i.preferred_common_name || i.scientificName,
        };
      });

      const initialCounts = {};
      animalWinners.forEach((i) => {
        const numericId = Number(i.taxonID);
        const animalId = !isNaN(numericId) ? numericId : i.scientificName;
        initialCounts[animalId] = i.count;
      });

      setSelection(initialSelection);
      setAnimalCounts(initialCounts);
      setObsState({
        humanPresent: winners.some((i) => i.observationType === "human"),
        vehiclePresent: winners.some((i) => i.observationType === "vehicle"),
        noAnimalsVisible: animalWinners.length === 0,
        comment: "",
      });
    }

    setRelabeling(true);
  };

  const showLoading = isSaving;

  return (
    <div style={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      justifyContent: "flex-start",
      padding: "0 10px",
      position: "relative"
    }}>
      {/* Background Loading indicator */}
      {showLoading && (
        <div style={{
          position: currentImage ? "absolute" : "relative",
          top: 0,
          left: currentImage ? 10 : 0,
          right: currentImage ? 10 : 0,
          zIndex: 0,
          width: "100%"
        }}>
          <Paper shadow="md" p="md" withBorder radius="md" style={{ backgroundColor: "var(--mantine-color-body)", opacity: 0.5 }}>
            <Stack gap="xs" align="center">
              <Text size="md" fw={700} ta="center" c="dimmed">
                Loading...
              </Text>
            </Stack>
          </Paper>
        </div>
      )}

      {/* Main Review Card */}
      {currentImage && !showLoading && (
        <div
          id="review-mode-controls"
          style={{
            width: "100%",
            zIndex: 1
          }}
        >
          <Paper shadow="md" p="md" withBorder radius="md" style={{ backgroundColor: "var(--mantine-color-body)" }}>
            <Stack gap="xs" align="center">
              <Text size="md" fw={700} ta="center">
                Does this photo have:
              </Text>
              <Stack gap={4} align="center">
                {summaryParts.length > 0 && !isBlank ? (
                  summaryParts
                ) : (
                  <Text fw={800} size="xl" c="blue">
                    No animals, humans, or vehicles
                  </Text>
                )}
              </Stack>
              <Group justify="space-between" mt="md" style={{ width: "100%" }} wrap="nowrap" gap="xs">
                <Tooltip
                  label="Re-label"
                  withinPortal
                  portalProps={{ zIndex: 1000000 }}
                >
                  <Button
                    id="relabel-button"
                    variant="light"
                    color="red"
                    radius="xl"
                    size="lg"
                    leftSection={<IconX size={24} />}
                    onClick={handleRelabel}
                    flex={1}
                    px={{ base: 10, xs: "xl" }}
                  >
                    Re-label
                  </Button>
                </Tooltip>

                <Tooltip
                  label="Confirm"
                  withinPortal
                  portalProps={{ zIndex: 1000000 }}
                >
                  <Button
                    id="confirm-button"
                    variant="filled"
                    color="green"
                    radius="xl"
                    size="lg"
                    rightSection={<IconCheck size={24} />}
                    onClick={handleConfirm}
                    loading={isSaving}
                    flex={1}
                    px={{ base: 10, xs: "xl" }}
                  >
                    Confirm
                  </Button>
                </Tooltip>
              </Group>
            </Stack>
          </Paper>
        </div>
      )}
    </div>
  );
};
