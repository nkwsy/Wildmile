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

const ITEMS_PER_PAGE = 20;

export default function Page() {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
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

      setImages(data.images);
      setTotalPages(Math.ceil(data.totalImages / ITEMS_PER_PAGE));
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
        <Container size="xl" py="xl">
          {/* <LoadingOverlay visible={loading} /> */}

          <Title order={1} mb="xl">
            Explore Wildlife
          </Title>
          <Grid>
            <Grid.Col
              span={{ base: 12, md: 6, lg: 5, xl: 5 }}
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
                totalImages={totalPages}
                page={page}
                setPage={setPage}
                loading={loading}
                emptyMessage="No images found"
                onPageChange={setPage}
              />
            </Grid.Col>
            {/* <Grid.Col span={{ base: 12, md: 7 }}>
            {totalPages > 1 && (
              <Group position="center" mt="xl">
                <Pagination
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                />
              </Group>
            )}
            <SimpleGrid
              cols={4}
              spacing="lg"
              breakpoints={[
                { maxWidth: "md", cols: 3 },
                { maxWidth: "sm", cols: 2 },
                { maxWidth: "xs", cols: 1 },
              ]}
            >
              {images &&
                images.map((image) => (
                  <Card
                    key={image.mediaID}
                    shadow="sm"
                    padding="lg"
                    radius="md"
                    className={classes.imageCard}
                  >
                    <Card.Section>
                      <Image
                        src={image.publicURL}
                        height={200}
                        alt="Wildlife"
                        onClick={() => handleImageClick(image)}
                        style={{ cursor: "pointer" }}
                      />
                    </Card.Section>
                    <Group position="apart" mt="md">
                      <Text size="sm">
                        {new Date(image.timestamp).toLocaleDateString()}
                      </Text>
                      <Badge variant="light">{image.consensusStatus}</Badge>
                    </Group>
                    {image.speciesConsensus &&
                      image.speciesConsensus.length > 0 && (
                        <Group mt="xs" spacing="xs">
                          {image.speciesConsensus.map((species, idx) => (
                            <Badge key={idx} size="sm" variant="outline">
                              {species.scientificName ||
                                species.observationType}
                              {species.count > 1 && ` (${species.count})`}
                            </Badge>
                          ))}
                        </Group>
                      )}
                  </Card>
                ))}
            </SimpleGrid>
          </Grid.Col> */}
          </Grid>

          {/* Image Modal */}
          {/* {selectedImage && (
          <Modal
            opened={imageModalOpened}
            onClose={closeImageModal}
            size="100%"
            padding={0}
            withCloseButton={false}
          >
            <div className={classes.modalContent}>
              <Image
                src={selectedImage.publicURL}
                fit="contain"
                height="90vh"
                alt="Wildlife"
              />
            </div>
          </Modal>
        )} */}
        </Container>
      </IdentificationProvider>
    </>
  );
}
