"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Group,
  LoadingOverlay,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Modal,
  ScrollArea,
  Pagination,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import classes from "styles/ExploreWildlife.module.css";
import { GalleryFilter } from "components/cameratrap/images/GalleryFilter";
import { IdentificationProvider } from "components/cameratrap/ContextCamera";
import { ImageGallery } from "components/cameratrap/images/ImageGallery";
import { DeploymentMapProvider } from "components/cameratrap/deployments/DeploymentMapContext";

const ITEMS_PER_PAGE = 20;

export default function Page() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const [imageModalOpened, { open: openImageModal, close: closeImageModal }] =
    useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentFilters, setCurrentFilters] = useState({});

  const fetchImages = async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters,
        page: page,
        limit: ITEMS_PER_PAGE,
      });

      const response = await fetch(
        `/api/cameratrap/getCameratrapImages?${params}`
      );
      const data = await response.json();
      console.log(data);
      setImages(data.images);
      // setTotalPages(Math.ceil(data.totalImages / ITEMS_PER_PAGE));
      setTotalImages(data.totalImages);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch images when page changes
  useEffect(() => {
    fetchImages(currentFilters);
  }, [page]);

  const handleFilterChange = (filters) => {
    setPage(1); // Reset to first page when filters change
    setCurrentFilters(filters);
    fetchImages(filters);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    openImageModal();
  };

  return (
    <>
      <IdentificationProvider>
        <DeploymentMapProvider>
          <Container fluid size="xl" py="xl">
            {/* <LoadingOverlay visible={loading} /> */}

            <Title order={1} mb="xl">
              Explore Wildlife
            </Title>
            <Grid>
              <Grid.Col
                span={{ base: 12, md: 6, lg: 5, xl: 3 }}
                style={{ height: "100%" }}
              >
                <ScrollArea style={{ height: "100%" }} offsetScrollbars>
                  <Paper p="md" mb="xl">
                    <GalleryFilter onFilterChange={handleFilterChange} />
                  </Paper>
                </ScrollArea>
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 7 }}>
                <ImageGallery
                  images={images}
                  totalImages={totalImages}
                  totalPages={totalPages}
                  page={page}
                  setPage={setPage}
                  loading={loading}
                  emptyMessage="No images found"
                  onPageChange={setPage}
                />
              </Grid.Col>
            </Grid>
          </Container>
        </DeploymentMapProvider>
      </IdentificationProvider>
    </>
  );
}
