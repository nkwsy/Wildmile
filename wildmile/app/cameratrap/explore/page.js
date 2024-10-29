"use client";
import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Paper,
  Text,
  Title,
  Group,
  Select,
  LoadingOverlay,
  SimpleGrid,
  Card,
  Image,
  Badge,
  ActionIcon,
  Pagination,
  Modal,
} from "@mantine/core";
import { IconHeart, IconZoomIn } from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import classes from "styles/ExploreWildlife.module.css";

const ITEMS_PER_PAGE = 20;

export default function ExploreWildlife() {
  const [speciesStats, setSpeciesStats] = useState([]);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [imageModalOpened, { open: openImageModal, close: closeImageModal }] =
    useDisclosure(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const fetchSpeciesData = async (species) => {
    try {
      const response = await fetch(
        `/api/species?species=${encodeURIComponent(species)}`
      );
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching species data:", error);
      return null;
    }
  };

  // Fetch species statistics on initial load
  useEffect(() => {
    fetchSpeciesStats();
  }, []);

  // Fetch images when species or page changes
  useEffect(() => {
    if (selectedSpecies) {
      fetchImages();
    }
  }, [selectedSpecies, page]);

  const fetchSpeciesStats = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cameratrap/explore/species-stats");
      const data = await response.json();
      setSpeciesStats(data);
    } catch (error) {
      console.error("Error fetching species stats:", error);
    }
    setLoading(false);
  };

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cameratrap/explore/species-images?species=${selectedSpecies}&page=${page}&limit=${ITEMS_PER_PAGE}`
      );
      const data = await response.json();
      setImages(data.images);
      setTotalPages(Math.ceil(data.total / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching images:", error);
    }
    setLoading(false);
  };

  const handleImageClick = (image) => {
    setSelectedImage(image);
    openImageModal();
  };

  return (
    <Container size="xl" py="xl">
      <LoadingOverlay visible={loading} />

      <Title order={1} mb="xl">
        Explore Wildlife
      </Title>

      <Grid>
        {/* Species Statistics */}
        <Grid.Col span={12}>
          <SimpleGrid
            cols={4}
            spacing="lg"
            breakpoints={[
              { maxWidth: "md", cols: 2 },
              { maxWidth: "sm", cols: 1 },
            ]}
          >
            {speciesStats.map((stat) => (
              <Paper key={stat.species} p="md" className={classes.statCard}>
                <Title order={3}>{stat.species}</Title>
                <Text size="xl" weight={700}>
                  {stat.count} sightings
                </Text>
                <Text size="sm" c="dimmed">
                  Last seen: {new Date(stat.lastSeen).toLocaleDateString()}
                </Text>
              </Paper>
            ))}
          </SimpleGrid>
        </Grid.Col>

        {/* Species Selection and Image Gallery */}
        <Grid.Col span={12}>
          <Select
            label="Select Species"
            placeholder="Choose a species to view images"
            data={speciesStats.map((stat) => ({
              value: stat.species,
              label: stat.species,
            }))}
            value={selectedSpecies}
            onChange={setSelectedSpecies}
            searchable
            mb="xl"
          />

          {selectedSpecies && (
            <>
              <SimpleGrid
                cols={4}
                spacing="lg"
                breakpoints={[
                  { maxWidth: "md", cols: 3 },
                  { maxWidth: "sm", cols: 2 },
                  { maxWidth: "xs", cols: 1 },
                ]}
              >
                {images.map((image) => (
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
                        alt={selectedSpecies}
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
                  </Card>
                ))}
              </SimpleGrid>

              <Group position="center" mt="xl">
                <Pagination
                  total={totalPages}
                  value={page}
                  onChange={setPage}
                />
              </Group>
            </>
          )}
        </Grid.Col>
      </Grid>

      {/* Image Modal */}
      {selectedImage && (
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
              alt={selectedSpecies}
            />
          </div>
        </Modal>
      )}
    </Container>
  );
}
