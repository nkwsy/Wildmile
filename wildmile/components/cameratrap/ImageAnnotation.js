"use client";

import React, { useState } from 'react';
import { Card, Image, Text, Button, NumberInput, Group, Stack, Badge } from '@mantine/core';
import { useImage, useSelection } from './ContextCamera';

export function ImageAnnotation({ fetchRandomImage }) {
  const [currentImage, setCurrentImage] = useImage();
  const [selection, setSelection] = useSelection();
  const [animalCounts, setAnimalCounts] = useState({});

  const handleCountChange = (id, value) => {
    setAnimalCounts(prev => ({ ...prev, [id]: value }));
  };

  const handleSaveObservations = async () => {
    if (!currentImage || selection.length === 0) return;

    const observations = selection.map(animal => ({
      mediaId: currentImage._id,
      scientificName: animal.name,
      count: animalCounts[animal.id] || 1,
      eventStart: currentImage.timestamp,
      eventEnd: currentImage.timestamp,
      observationLevel: 'media',
      observationType: 'animal',
    }));

    try {
      const response = await fetch('/api/saveObservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observations),
      });

      if (response.ok) {
        // alert('Observations saved successfully!');
        setSelection([]);
        setAnimalCounts({});
        // Fetch a new random image after successful submission
        await fetchRandomImage();
      } else {
        alert('Failed to save observations');
      }
    } catch (error) {
      console.error('Error saving observations:', error);
      alert('Error saving observations');
    }
  };

  if (!currentImage) {
    return <Text>No image selected</Text>;
  }

  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Card.Section>
        <Image
          src={currentImage.publicURL}
          fit="contain"
          height={500}
          width="100%"
          alt="Wildlife image"
        />
      </Card.Section>

      <Text mt="md">Image Timestamp: {new Date(currentImage.timestamp).toLocaleString()}</Text>

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

      {selection.length > 0 ? (
        <Button color="blue" fullWidth mt="md" radius="md" onClick={handleSaveObservations}>
          Save Observations
        </Button>
      ) : (
        <Text color="dimmed" align="center" mt="md">Select animals from the search results to add observations</Text>
      )}
    </Card>
  );
}
