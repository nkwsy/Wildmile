"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Text,
  Button,
  NumberInput,
  Group,
  Stack,
  Checkbox,
  TextInput,
  ActionIcon,
  Flex,
  Paper,
} from "@mantine/core";
import {
  IconSend,
  IconX,
  IconPlus,
  IconMinus,
  IconHelp,
} from "@tabler/icons-react";
import {
  useImage,
  useSelection,
  useRecentSpecies,
  useUserLabeledSpecies,
  useAnimalCounts,
  useObservationState,
  useTutorial,
  useReviewMode,
  useRelabeling
} from "./ContextCamera";
import checkboxClasses from "styles/checkbox.module.css";
import styles from "styles/animalSelection.module.css";

const SELECTION_COLORS = [
  "rgba(255, 99, 132, 0.15)", // Pink
  "rgba(54, 162, 235, 0.15)", // Blue
  "rgba(255, 206, 86, 0.15)", // Yellow
  "rgba(75, 192, 192, 0.15)", // Teal
  "rgba(153, 102, 255, 0.15)", // Purple
  "rgba(255, 159, 64, 0.15)", // Orange
  "rgba(40, 167, 69, 0.15)", // Green
  "rgba(23, 162, 184, 0.15)", // Cyan
  "rgba(102, 102, 102, 0.15)", // Gray
];

export function ObservationTally({ fetchNextImage }) {
  const [currentImage] = useImage();
  const [selection, setSelection] = useSelection();
  const [recentSpecies, setRecentSpecies] = useRecentSpecies();
  const [userLabeledSpecies, setUserLabeledSpecies] = useUserLabeledSpecies();
  const [animalCounts, setAnimalCounts] = useAnimalCounts();
  const [obsState, setObsState] = useObservationState();
  const [runTutorial, setRunTutorial] = useTutorial();
  const [reviewMode] = useReviewMode();
  const [, setRelabeling] = useRelabeling();
  const [isSaving, setIsSaving] = useState(false);
  const [comments, setComments] = useState([]);

  const { humanPresent, vehiclePresent, noAnimalsVisible, comment } = obsState;

  useEffect(() => {
    if (currentImage) {
      setComments(currentImage.mediaComments || []);
      // Clear comment for new image, but keep animal selection and other toggles
      setObsState((prev) => ({
        ...prev,
        comment: "",
      }));
    }
  }, [currentImage, setObsState]);

  const handleCountChange = (id, value) => {
    setAnimalCounts((prev) => ({ ...prev, [id]: value }));
  };

  const loadUserLabeled = useCallback(async () => {
    try {
      const res = await fetch("/api/cameratrap/user-labeled-species");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setUserLabeledSpecies(data);
    } catch (error) {
      console.error("Error fetching user labeled species:", error);
    }
  }, [setUserLabeledSpecies]);

  const handleSaveObservations = useCallback(async ({ forceNoAnimals = false } = {}) => {
    if (!currentImage) return;

    setIsSaving(true);

    // Add comment if exists
    if (comment.trim()) {
      try {
        const response = await fetch("/api/cameratrap/addComment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mediaId: currentImage.mediaID, comment }),
        });
        if (response.ok) {
          const newComment = await response.json();
          setComments(prev => [...prev, newComment]);
          setObsState(prev => ({ ...prev, comment: "" }));
        }
      } catch (e) {
        console.error("Error adding comment", e);
      }
    }

    let observations = [];

    if (
      (forceNoAnimals || noAnimalsVisible) &&
      !humanPresent &&
      !vehiclePresent
    ) {
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
      if (selection.length > 0) {
        observations = selection.map((animal) => {
          const animalId = animal.taxonId || animal.id;
          return {
            mediaId: currentImage.mediaID,
            mediaInfo: {
              md5: currentImage.mediaID,
              imageHash: currentImage.imageHash,
            },
            taxonId: animalId,
            scientificName: animal.name,
            commonName: animal.preferred_common_name || animal.name,
            count: animalCounts[animalId] || 1,
            eventStart: currentImage.timestamp,
            eventEnd: currentImage.timestamp,
            observationLevel: "media",
            observationType: "animal",
          };
        });
      }

      if (humanPresent) {
        observations.push({
          mediaId: currentImage.mediaID,
          mediaInfo: {
            md5: currentImage.mediaID,
            imageHash: currentImage.imageHash,
          },
          eventStart: currentImage.timestamp,
          eventEnd: currentImage.timestamp,
          observationLevel: "media",
          observationType: "human",
        });
      }

      if (vehiclePresent) {
        observations.push({
          mediaId: currentImage.mediaID,
          mediaInfo: {
            md5: currentImage.mediaID,
            imageHash: currentImage.imageHash,
          },
          eventStart: currentImage.timestamp,
          eventEnd: currentImage.timestamp,
          observationLevel: "media",
          observationType: "vehicle",
        });
      }
    }

    try {
      const response = await fetch("/api/cameratrap/saveObservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(observations),
      });

      if (response.ok) {
        const data = await response.json();
        try {
          // First successful save dismisses the auto-tutorial on future visits.
          window.localStorage.setItem("wildmile.hasAnnotated", "true");
        } catch (e) {
          // localStorage may be unavailable; fail silently.
        }
        if (data.savedSpecies?.length) {
          setRecentSpecies((prev) => {
            // Get the list of unique species that were just saved
            const justSaved = selection.filter((s) =>
              data.savedSpecies.includes(s.name)
            );

            // IDs of the just-saved species
            const savedIds = new Set(justSaved.map((s) => s.taxonId || s.id));

            // Remove just-saved species from the existing recent list to avoid duplicates
            const remaining = prev.filter(
              (s) => !savedIds.has(s.taxonId || s.id)
            );

            // Combine and limit to 10
            return [...justSaved, ...remaining].slice(0, 10);
          });
        }
        await loadUserLabeled();
        if (reviewMode) {
          setSelection([]);
          setAnimalCounts({});
        }
        await fetchNextImage();
        setRelabeling(false);
      } else {
        alert("Failed to save observations.");
      }
    } catch (error) {
      console.error("Error saving observations:", error);
    } finally {
      setIsSaving(false);
    }
  }, [
    currentImage,
    comment,
    noAnimalsVisible,
    humanPresent,
    vehiclePresent,
    selection,
    animalCounts,
    fetchNextImage,
    setObsState,
    setRecentSpecies,
    loadUserLabeled,
  ]);

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await fetch("/api/cameratrap/addComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage.mediaID, comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setObsState(prev => ({ ...prev, comment: "" }));
      }
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleRemoveAnimal = (idToRemove) => {
    setSelection((prev) =>
      prev.filter((animal) => (animal.taxonId || animal.id) !== idToRemove)
    );
    setAnimalCounts((prev) => {
      const newCounts = { ...prev };
      delete newCounts[idToRemove];
      return newCounts;
    });
  };

  if (!currentImage && !runTutorial) return null;

  const summaryParts = selection.map((animal) => {
    const animalId = animal.taxonId || animal.id;
    const count = animalCounts[animalId] || 1;
    const name = animal.preferred_common_name || animal.name;
    return `${count}x ${name}`;
  });

  if (humanPresent) summaryParts.push("+ Human");
  if (vehiclePresent) summaryParts.push("+ Vehicle");

  const summary = summaryParts.join(", ");

  return (
    <Paper
      shadow="xs"
      p="xs"
      withBorder
      radius="md"
      id="observation-tally-container"
      style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}
    >
      <Stack gap="xs">
        <Group justify="space-between" align="center">
          <Text fw={700}>Observations</Text>
          <Group gap="xs" id="human-vehicle-checkboxes">
            <Checkbox
              classNames={checkboxClasses}
              label="Human"
              checked={humanPresent}
              readOnly
              wrapperProps={{
                onClick: () =>
                  setObsState((prev) => ({
                    ...prev,
                    humanPresent: !prev.humanPresent,
                  })),
              }}
            />
            <Checkbox
              classNames={checkboxClasses}
              label="Vehicle"
              checked={vehiclePresent}
              readOnly
              wrapperProps={{
                onClick: () =>
                  setObsState((prev) => ({
                    ...prev,
                    vehiclePresent: !prev.vehiclePresent,
                  })),
              }}
            />
          </Group>
        </Group>

        <Stack gap="xs">
          {summary && (
            <Text size="sm" fw={600} c="dimmed" fs="italic">
              Saving: {summary}
            </Text>
          )}
        </Stack>

        <Stack gap="xs">
          <Group id="comment-input">
            <TextInput
              placeholder="Add a comment..."
              size="xs"
              value={comment}
              onChange={(event) => {
                const val = event.currentTarget.value;
                setObsState((prev) => ({
                  ...prev,
                  comment: val,
                }));
              }}
              style={{ flex: 1 }}
            />
            <ActionIcon onClick={handleAddComment} disabled={!comment.trim()}>
              <IconSend size={24} />
            </ActionIcon>
          </Group>

          {noAnimalsVisible ||
          selection.length > 0 ||
          humanPresent ||
          vehiclePresent ? (
            <Button
              id="save-observations-button"
              size="md"
              color="blue"
              fullWidth
              onClick={() => handleSaveObservations()}
              loading={isSaving}
            >
              {isSaving ? "Saving..." : "Save Observations"}
            </Button>
          ) : (
            <Button
              id="save-observations-button"
              size="md"
              color="blue"
              variant="outline"
              fullWidth
              onClick={() => handleSaveObservations({ forceNoAnimals: true })}
              loading={isSaving}
            >
              No Animals Visible
            </Button>
          )}
          {reviewMode && (
            <Button
              size="sm"
              variant="subtle"
              color="gray"
              onClick={() => setRelabeling(false)}
            >
              Cancel Re-label
            </Button>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}
