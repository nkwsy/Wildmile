"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  Image,
  Text,
  Button,
  NumberInput,
  Group,
  Stack,
  Badge,
  Checkbox,
  TextInput,
  ActionIcon,
  Modal,
} from "@mantine/core";
import {
  IconHeart,
  IconHeartFilled,
  IconSend,
  IconMaximize,
} from "@tabler/icons-react";
import { useImage, useSelection } from "./ContextCamera";

export function ImageAnnotation({ fetchRandomImage }) {
  const [currentImage, setCurrentImage] = useImage();
  const [selection, setSelection] = useSelection();
  const [animalCounts, setAnimalCounts] = useState({});
  const [noAnimalsVisible, setNoAnimalsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(false);

  useEffect(() => {
    if (currentImage) {
      setComments(currentImage.mediaComments || []);
      setIsFavorite(currentImage.favorite || false);
    }
  }, [currentImage]);

  const handleCountChange = (id, value) => {
    setAnimalCounts((prev) => ({ ...prev, [id]: value }));
  };

  const handleNoAnimalsClick = () => {
    setNoAnimalsVisible(true);
    setSelection([]);
    setAnimalCounts({});
    handleSaveObservations();
  };

  const handleSaveObservations = async () => {
    if (!currentImage) return;

    setIsSaving(true);

    let observations = [];

    if (noAnimalsVisible || selection.length === 0) {
      observations = [
        {
          mediaId: currentImage._id,
          eventStart: currentImage.timestamp,
          eventEnd: currentImage.timestamp,
          observationLevel: "media",
          observationType: "blank",
        },
      ];
    } else {
      observations = selection.map((animal) => ({
        mediaId: currentImage._id,
        scientificName: animal.name,
        count: animalCounts[animal.id] || 1,
        eventStart: currentImage.timestamp,
        eventEnd: currentImage.timestamp,
        observationLevel: "media",
        observationType: "animal",
      }));
    }

    try {
      const response = await fetch("/api/cameratrap/saveObservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(observations),
        credentials: "include",
      });

      if (response.ok) {
        if (comment.trim()) {
          await handleAddComment();
        }
        setSelection([]);
        setAnimalCounts({});
        setNoAnimalsVisible(false);
        await fetchRandomImage();
      } else {
        alert("Failed to save observations");
      }
    } catch (error) {
      console.error("Error saving observations:", error);
      alert("Error saving observations");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;

    try {
      const response = await fetch("/api/cameratrap/addComment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage._id, comment }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments([...comments, newComment]);
        setComment("");
      } else {
        alert("Failed to add comment");
      }
    } catch (error) {
      console.error("Error adding comment:", error);
      alert("Error adding comment");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      const response = await fetch("/api/cameratrap/toggleFavorite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaId: currentImage._id }),
      });

      if (response.ok) {
        setIsFavorite(!isFavorite);
      } else {
        alert("Failed to toggle favorite");
      }
    } catch (error) {
      console.error("Error toggling favorite:", error);
      alert("Error toggling favorite");
    }
  };

  const toggleEnlargedImage = () => {
    setEnlargedImage(!enlargedImage);
  };

  if (!currentImage) {
    return <Text>No image selected</Text>;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <div style={{ position: "relative" }}>
          <Image
            src={currentImage.publicURL}
            fit="contain"
            // height={700}
            width="100%"
            alt="Wildlife image"
          />
          <ActionIcon
            style={{ position: "absolute", top: 10, right: 10 }}
            onClick={toggleEnlargedImage}
          >
            <IconMaximize size={24} />
          </ActionIcon>
        </div>
      </Card.Section>

      <Text mt="md">
        Image Timestamp: {new Date(currentImage.timestamp).toLocaleString()}
      </Text>

      {!noAnimalsVisible && (
        <Stack spacing="xs" mt="md">
          {selection.map((animal) => (
            <Group key={animal.id} position="apart">
              <Text>{animal.preferred_common_name || animal.name}</Text>
              <NumberInput
                value={animalCounts[animal.id] || 1}
                onChange={(value) => handleCountChange(animal.id, value)}
                min={1}
                max={100}
                style={{ width: 80 }}
              />
            </Group>
          ))}
        </Stack>
      )}

      <Group position="apart" mt="md">
        <ActionIcon
          onClick={handleToggleFavorite}
          color={isFavorite ? "red" : "lightgray"}
        >
          {isFavorite ? <IconHeartFilled size={24} /> : <IconHeart size={24} />}
        </ActionIcon>
        <Text size="sm">Favorites: {currentImage.favoriteCount || 0}</Text>

        <TextInput
          placeholder="Add a comment..."
          value={comment}
          onChange={(event) => setComment(event.currentTarget.value)}
          style={{ flex: 1 }}
        />
        <ActionIcon onClick={handleAddComment} disabled={!comment.trim()}>
          <IconSend size={24} />
        </ActionIcon>
      </Group>
      <Stack spacing="xs" mt="md">
        {comments.map((comment, index) => (
          <Text key={index} size="sm">
            <strong>{comment.author.name}:</strong> {comment.text}
          </Text>
        ))}
      </Stack>

      {noAnimalsVisible || selection.length > 0 ? (
        <Button
          color="blue"
          fullWidth
          mt="md"
          radius="md"
          onClick={handleSaveObservations}
          loading={isSaving}
        >
          {isSaving ? "Saving..." : "Save Observations"}
        </Button>
      ) : (
        <Button
          color="cyan"
          fullWidth
          mt="md"
          radius="md"
          onClick={handleNoAnimalsClick}
          loading={isSaving}
        >
          No Animals Visible
        </Button>
      )}

      {selection.length === 0 && !noAnimalsVisible && (
        <Text color="dimmed" align="center" mt="md">
          Select animals from the search results to add observations or mark as
          "No Animals Visible"
        </Text>
      )}

      <Modal
        opened={enlargedImage}
        onClose={() => setEnlargedImage(false)}
        size="100%"
        padding={0}
        styles={{
          inner: { padding: 0 },
          modal: { maxWidth: "100%" },
        }}
      >
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <Image
            src={currentImage.publicURL}
            fit="contain"
            // height="100vh"
            width="90%"
            alt="Enlarged wildlife image"
          />
        </div>
      </Modal>
    </Card>
  );
}
