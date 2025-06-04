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
  Box,
  Loader,
} from "@mantine/core";
import {
  ImageGallery,
  ImageCard,
} from "components/cameratrap/images/ImageGallery";

export function LocationImages({
  locationId,
  imagesPerPage = 12,
  homepage = false,
}) {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [totalImages, setTotalImages] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const params = new URLSearchParams({
    locationId: locationId,
    page: page,
    limit: homepage ? 1 : imagesPerPage,
    sort: "createdAt",
    sortDirection: "desc",
  });

  useEffect(() => {
    async function fetchImages() {
      const response = await fetch(
        `/api/cameratrap/getCameratrapImages?${params}`
      );
      const data = await response.json();
      setImages(data.images);
      setTotalImages(data.totalImages);
      setTotalPages(data.totalPages);
      setLoading(false);
    }
    fetchImages();
  }, [locationId, page]);

  if (homepage) {
    if (loading) {
      return <Loader />;
    } else if (images.length > 0) {
      return <ImageCard image={images[0]} />;
    } else {
      return <Text>No images found for this location</Text>;
    }
  }
  return (
    <Paper shadow="xs" p="md" radius="md">
      <Title order={4} mb="md">
        Location Images
      </Title>
      <ImageGallery
        images={images}
        loading={loading}
        totalImages={totalImages}
        totalPages={totalPages}
        page={page}
        onPageChange={setPage}
        emptyMessage="No images found for this location"
      />
    </Paper>
  );
}
