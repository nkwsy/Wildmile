import { useState, useEffect } from "react";
import {
  Paper,
  Text,
  Grid,
  Image,
  Group,
  Button,
  Stack,
  Pagination,
  LoadingOverlay,
  Badge,
} from "@mantine/core";
import { IconPhoto, IconEye } from "@tabler/icons-react";

export function DeploymentImages({ deploymentId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const IMAGES_PER_PAGE = 12;

  const fetchImages = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `/api/cameratrap/deployments/${deploymentId}/images?page=${page}&limit=${IMAGES_PER_PAGE}`
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data.images);
      setTotalImages(data.totalImages);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching deployment images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deploymentId) {
      fetchImages();
    }
  }, [deploymentId, page]);

  if (error) {
    return (
      <Paper p="md" withBorder>
        <Text color="red">{error}</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <LoadingOverlay visible={loading} />

      <Stack spacing="md">
        <Group position="apart">
          <Group>
            <IconPhoto size={24} />
            <Text size="lg" weight={500}>
              Deployment Images
            </Text>
            <Badge size="lg">{totalImages} images</Badge>
          </Group>
        </Group>

        {images.length === 0 && !loading ? (
          <Text color="dimmed" align="center" py="xl">
            No images found for this deployment
          </Text>
        ) : (
          <>
            <Grid>
              {images.map((image) => (
                <Grid.Col
                  key={image._id}
                  span={{ base: 12, sm: 6, md: 4, lg: 3 }}
                >
                  <Paper p="xs" withBorder>
                    <Stack spacing="xs">
                      <Image
                        src={image.publicURL}
                        alt={image.relativePath[image.relativePath.length - 1]}
                        radius="sm"
                        height={200}
                        fit="cover"
                        withPlaceholder
                      />
                      <Group position="apart" noWrap>
                        <Text size="sm" truncate>
                          {image.relativePath[image.relativePath.length - 1]}
                        </Text>
                        {image.reviewed && (
                          <Badge
                            size="sm"
                            variant="light"
                            leftSection={<IconEye size={12} />}
                          >
                            Reviewed
                          </Badge>
                        )}
                      </Group>
                      <Text size="xs" color="dimmed">
                        {new Date(image.timestamp).toLocaleString()}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>

            {totalImages > IMAGES_PER_PAGE && (
              <Pagination
                total={Math.ceil(totalImages / IMAGES_PER_PAGE)}
                value={page}
                onChange={setPage}
                position="center"
                mt="md"
              />
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}
