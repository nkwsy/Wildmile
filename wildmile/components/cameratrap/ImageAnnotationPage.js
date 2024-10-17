"use client";

import React, { useState } from 'react';
import { Paper, Button, Group, Stack } from '@mantine/core';
import { useImage } from './ContextCamera';
import { ImageAnnotation } from './ImageAnnotation';
import WildlifeSearch from './WildlifeSearch';

export const ImageAnnotationPage = () => {
  const [currentImage, setCurrentImage] = useImage();

  const fetchRandomImage = async () => {
    try {
      const response = await fetch('/api/getRandomImage');
      if (response.ok) {
        const image = await response.json();
        setCurrentImage(image);
      } else {
        console.error('Failed to fetch random image');
      }
    } catch (error) {
      console.error('Error fetching random image:', error);
    }
  };

  return (
    <Group align="flex-start" spacing="xl">
      <Paper shadow="xs" p="xl" style={{ flex: 1 }}>
        <Button onClick={fetchRandomImage} mb="md">
          Get Random Image
        </Button>
        <ImageAnnotation fetchRandomImage={fetchRandomImage} />
      </Paper>
      
      <Stack spacing="xl" style={{ flex: 1 }}>
        <WildlifeSearch />
      </Stack>
    </Group>
  );
};

export default ImageAnnotationPage;
