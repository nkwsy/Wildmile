"use client";

import React, { useState } from 'react';
import { Card, Image, Text, Button, NumberInput, Group, Stack, Badge, Checkbox } from '@mantine/core';
import { useImage, useSelection } from './ContextCamera';

export function ImageAnnotation({ fetchRandomImage }) {
  const [currentImage, setCurrentImage] = useImage();
  const [selection, setSelection] = useSelection();
  const [animalCounts, setAnimalCounts] = useState({});
  const [noAnimalsVisible, setNoAnimalsVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleCountChange = (id, value) => {
    setAnimalCounts(prev => ({ ...prev, [id]: value }));
  };

  const handleNoAnimalsChange = (event) => {
    setNoAnimalsVisible(event.currentTarget.checked);
    if (event.currentTarget.checked) {
      setSelection([]);
      setAnimalCounts({});
    }
  };

  const handleSaveObservations = async () => {
    if (!currentImage) return;
    if (!noAnimalsVisible && selection.length === 0) return;

    setIsSaving(true);

    let observations;

    if (noAnimalsVisible) {
      observations = [{
        mediaId: currentImage._id,
        eventStart: currentImage.timestamp,
        eventEnd: currentImage.timestamp,
        observationLevel: 'media',
        observationType: 'blank', // Explicitly set to 'blank' for "No Animals Visible"
      }];
    } else {
      observations = selection.map(animal => ({
        mediaId: currentImage._id,
        scientificName: animal.name,
        count: animalCounts[animal.id] || 1,
        eventStart: currentImage.timestamp,
        eventEnd: currentImage.timestamp,
        observationLevel: 'media',
        observationType: 'animal',
      }));
    }

    try {
      const response = await fetch('/api/saveObservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(observations),
      });

      if (response.ok) {
        setSelection([]);
        setAnimalCounts({});
        setNoAnimalsVisible(false);
        await fetchRandomImage();
      } else {
        alert('Failed to save observations');
      }
    } catch (error) {
      console.error('Error saving observations:', error);
      alert('Error saving observations');
    } finally {
      setIsSaving(false);
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

      <Checkbox
        label="No Animals Visible"
        checked={noAnimalsVisible}
        onChange={handleNoAnimalsChange}
        mt="md"
      />

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

      {(noAnimalsVisible || selection.length > 0) ? (
        <Button 
          color="blue" 
          fullWidth 
          mt="md" 
          radius="md" 
          onClick={handleSaveObservations}
          loading={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Observations'}
        </Button>
      ) : (
        <Text color="dimmed" align="center" mt="md">
          Select animals from the search results to add observations or mark as "No Animals Visible"
        </Text>
      )}
    </Card>
  );
}
