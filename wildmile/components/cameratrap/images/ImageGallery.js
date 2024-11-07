"use client";
import {
  Grid,
  Paper,
  Text,
  Stack,
  Group,
  Badge,
  Image,
  Pagination,
  Modal,
} from "@mantine/core";
import { IconEye, IconHeart } from "@tabler/icons-react";
import { SpeciesConsensusBadges } from "../SpeciesConsensusBadges";
import { LoadingOverlay } from "@mantine/core";
import { useState } from "react";

export function ImageGallery({
  images = [],
  loading = false,
  page = 1,
  totalImages = 0,
  imagesPerPage = 12,
  onPageChange,
  emptyMessage = "No images found",
  imageHeight = 200,
}) {
  if (images.length === 0 && !loading) {
    return (
      <Text color="dimmed" align="center" py="xl">
        {emptyMessage}
      </Text>
    );
  }

  return (
    <>
      <Grid>
        {images.map((image) => (
          <Grid.Col key={image._id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
            <ImageCard image={image} imageHeight={imageHeight} />
          </Grid.Col>
        ))}
      </Grid>

      {totalImages > imagesPerPage && (
        <Pagination
          total={Math.ceil(totalImages / imagesPerPage)}
          value={page}
          onChange={onPageChange}
          position="center"
          mt="md"
        />
      )}
    </>
  );
}

function ImageCard({ image, imageHeight }) {
  const [opened, setOpened] = useState(false);

  return (
    <Paper p="xs" withBorder>
      <Stack spacing="xs">
        <Image
          src={image.publicURL}
          alt={image.relativePath?.[image.relativePath.length - 1] || "Image"}
          radius="sm"
          height={imageHeight}
          fit="cover"
          withPlaceholder
          style={{ cursor: "pointer" }}
          onClick={() => setOpened(true)}
        />
        <ImageInfo image={image} />

        <Modal
          opened={opened}
          onClose={() => setOpened(false)}
          size="xl"
          padding="xs"
        >
          <Image
            src={image.publicURL}
            alt={image.relativePath?.[image.relativePath.length - 1] || "Image"}
            fit="cover"
            height="90%"
          />
        </Modal>
      </Stack>
    </Paper>
  );
}

function ImageInfo({ image }) {
  return (
    <>
      <Group position="apart" noWrap>
        {/* <Text size="xs" truncate>
          {image.relativePath?.[image.relativePath.length - 1]}
        </Text> */}
        {image.reviewCount > 0 && (
          <Badge size="sm" variant="light" leftSection={<IconEye size={10} />}>
            {image.reviewCount}
          </Badge>
        )}
        {image.speciesConsensus && (
          <SpeciesConsensusBadges speciesConsensus={image.speciesConsensus} />
        )}
        {image.favoriteCount > 0 && (
          <Badge size="sm" variant="light" color="pink">
            <IconHeart size={10} /> {image.favoriteCount}
          </Badge>
        )}
      </Group>
      <Text size="xs" color="dimmed">
        {new Date(image.timestamp).toLocaleString()}
      </Text>
    </>
  );
}
