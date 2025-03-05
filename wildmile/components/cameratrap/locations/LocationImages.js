import { useState, useEffect } from "react";
import {
  Paper,
  Title,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Group,
  Text,
} from "@mantine/core";
import { ImageGallery } from "components/cameratrap/images/ImageGallery";

export function LocationImages({ locationId }) {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch(
        `/api/cameratrap/getCameratrapImages?locationId=${locationId}&page=${page}`
      );
      const data = await response.json();
      setImages(data.images);
      setLoading(false);
    }
    fetchImages();
  }, [locationId, page]);

  return (
    <Paper shadow="xs" p="md" radius="md">
      <Title order={4} mb="md">
        Location Images
      </Title>
      <ImageGallery
        images={images}
        loading={loading}
        page={page}
        setPage={setPage}
        emptyMessage="No images found for this location"
      />
    </Paper>
  );
}
