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
  Tooltip,
  ActionIcon,
  Box,
} from "@mantine/core";
import { IconEye, IconHeart, IconLink } from "@tabler/icons-react";
import Link from "next/link";

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
      {totalImages > imagesPerPage && (
        <Pagination
          total={Math.ceil(totalImages / imagesPerPage)}
          value={page}
          onChange={onPageChange}
          position="center"
          mt="md"
        />
      )}
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
          <ImageInfo image={image} />
        </Modal>
      </Stack>
    </Paper>
  );
}

function ImageInfo({ image }) {
  return (
    <Stack justify="flex-start" gap={1}>
      <Group position="apart" noWrap>
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

      <Group wrap="nowrap" justify="space-between">
        <Text size="xs" mb={0} color="dimmed">
          {new Date(image.timestamp).toLocaleDateString("en-US", {
            timeZone: "UTC",
            year: "2-digit",
            month: "numeric",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          })}
        </Text>
        <Tooltip label="Go to image">
          <ActionIcon
            component={Link}
            href={`/cameratrap/identify/${image.mediaID}`}
            variant="subtle"
            size="xs"
            justify="flex-end"
          >
            <IconLink size={14} />
          </ActionIcon>
        </Tooltip>
      </Group>
    </Stack>
  );
}
