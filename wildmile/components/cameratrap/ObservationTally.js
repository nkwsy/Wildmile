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
  useTutorial
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
            const existingNames = new Set(
              prev.map((s) => s.name?.toLowerCase())
            );
            const newEntries = selection
              .filter(
                (s) =>
                  data.savedSpecies.includes(s.name) &&
                  !existingNames.has(s.name?.toLowerCase())
              )
              .map((s) => ({
                ...s,
                name: s.name,
                preferred_common_name: s.preferred_common_name,
              }));
            if (!newEntries.length) return prev;
            return [...newEntries, ...prev].slice(0, 12);
          });
        }
        await loadUserLabeled();
        fetchNextImage();
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

  return (
    <Paper
      shadow="xs"
      p="md"
      withBorder
      radius="md"
      id="observation-tally-container"
      style={{ display: "flex", flexDirection: "column", flexShrink: 0 }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="center">
          <Text fw={700}>Observations</Text>
          <Button
            id="help-button"
            size="xs"
            color="green"
            variant="outline"
            onClick={() => setRunTutorial((prev) => prev + 1)}
            leftSection={<IconHelp size={16} />}
          >
            Help
          </Button>
        </Group>

        <Stack gap="md">
          {!noAnimalsVisible && selection.length > 0 && (
            <Flex direction="row" wrap="wrap" gap="xs">
              {selection.map((animal, index) => {
                  const animalId = animal.taxonId || animal.id;
                  const bgColor =
                    SELECTION_COLORS[index % SELECTION_COLORS.length];
                  return (
                    <div
                      key={animalId}
                      className={styles.selectionContainer}
                      style={{ backgroundColor: bgColor }}
                    >
                      <div className={styles.selectionContent}>
                        <Text size="sm" className={styles.speciesName}>
                          {animal.preferred_common_name || animal.name}
                        </Text>
                        <div className={styles.controls}>
                          <Group gap={2}>
                            <ActionIcon
                              size="lg"
                              variant="subtle"
                              onClick={() =>
                                handleCountChange(
                                  animalId,
                                  Math.max(1, (animalCounts[animalId] || 1) - 1)
                                )
                              }
                              disabled={(animalCounts[animalId] || 1) <= 1}
                            >
                              <IconMinus size={22} />
                            </ActionIcon>
                            <NumberInput
                              size="xs"
                              value={animalCounts[animalId] ?? 1}
                              onChange={(value) => {
                                // Allow the input to be empty while typing
                                if (value === "" || value === undefined) {
                                  handleCountChange(animalId, "");
                                } else {
                                  handleCountChange(animalId, value);
                                }
                              }}
                              hideControls
                              min={1}
                              max={99}
                              style={{ width: 50 }}
                              styles={{
                                input: {
                                  textAlign: "center",
                                  fontWeight: 600,
                                  fontSize: 14,
                                },
                              }}
                            />
                            <ActionIcon
                              size="lg"
                              variant="subtle"
                              onClick={() =>
                                handleCountChange(
                                  animalId,
                                  (animalCounts[animalId] || 1) + 1
                                )
                              }
                            >
                              <IconPlus size={22} />
                            </ActionIcon>
                          </Group>
                          <ActionIcon
                            size="sm"
                            color="red"
                            variant="subtle"
                            onClick={() => handleRemoveAnimal(animalId)}
                            className={styles.removeButton}
                          >
                            <IconX size={22} />
                          </ActionIcon>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </Flex>
            )}

          {comments.length > 0 && (
            <Stack gap="xs">
              <Text size="sm" fw={700}>
                Recent Comments
              </Text>
              {comments.map((comment, index) => (
                <Text key={index} size="sm">
                  <strong>{comment.author.name}:</strong> {comment.text}
                </Text>
              ))}
            </Stack>
          )}
        </Stack>

        <Stack gap="md">
          <Group grow wrap="nowrap" id="human-vehicle-checkboxes">
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

          <Group id="comment-input">
            <TextInput
              placeholder="Add a comment..."
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
        </Stack>
      </Stack>
    </Paper>
  );
}
