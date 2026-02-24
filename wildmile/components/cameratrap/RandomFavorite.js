"use client";

import { useState, useEffect } from "react";
import {
  Card,
  Image,
  Text,
  Title,
  Button,
  LoadingOverlay,
  Modal,
  Flex,
  Group,
  ActionIcon,
  Fieldset,
} from "@mantine/core";
import {
  IconRefresh,
  IconMaximize,
  IconArrowsShuffle,
} from "@tabler/icons-react";
import classes from "styles/CameraTrap.module.css";
import useSWR from "swr";

const fetcher = async (url) => {
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) throw new Error("Failed to fetch");
  return response.json();
};

export function RandomFavorite() {
  const [loading, setLoading] = useState(false);
  const [enlargedImage, setEnlargedImage] = useState(false);

  const {
    data: favoriteImage,
    error,
    isLoading,
    mutate,
  } = useSWR("/api/cameratrap/randomFavorite", fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 0,
  });

  const fetchRandomFavorite = () => {
    setLoading(true);
    mutate().finally(() => setLoading(false));
  };

  if (isLoading) return <div>Loading...</div>;

  if (error || !favoriteImage) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text align="center">No favorite images found</Text>
        <Button
          mt="md"
          variant="light"
          color="blue"
          onClick={fetchRandomFavorite}
          loading={loading}
          leftSection={<IconArrowsShuffle />}
          fullWidth
        >
          Try Again
        </Button>
      </Card>
    );
  }

  return (
    <>
      <Fieldset legend="Random Favorite">
        <div style={{ position: "relative", minHeight: 300 }}>
          {favoriteImage && (
            <>
              <Image
                src={favoriteImage.publicURL}
                alt="Random favorite wildlife image"
                className={classes.mainImage}
                style={{ objectFit: "contain" }}
              />
              <ActionIcon
                style={{ position: "absolute", top: 10, right: 10 }}
                onClick={() => setEnlargedImage(true)}
              >
                <IconMaximize size={24} />
              </ActionIcon>
              {/* <Group gap="sm"> */}
              <Flex direction={{ base: "column", sm: "row" }} gap="sm">
                <Text size="sm" c="dimmed" mt="md" flex="1">
                  Captured on:{" "}
                  {new Date(favoriteImage.timestamp).toLocaleString()}
                </Text>
                <Text size="sm" c="dimmed" mt="md" flex="1">
                  Favorites: {favoriteImage.favorites?.length || 0}
                </Text>
                <Button
                  mt="md"
                  // flex="1"
                  wrap="wrap"
                  variant="light"
                  color="blue"
                  onClick={fetchRandomFavorite}
                  loading={loading}
                  leftSection={<IconArrowsShuffle />}
                >
                  New Image
                </Button>
              </Flex>
              {/* </Group> */}
            </>
          )}
        </div>
      </Fieldset>

      <Modal
        opened={enlargedImage}
        onClose={() => setEnlargedImage(false)}
        size="100%"
        padding={0}
        styles={{
          inner: { padding: 0 },
          modal: { maxWidth: "100%" },
        }}
      >
        <div
          style={{
            width: "100vw",
            height: "100vh",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          <Image
            src={favoriteImage?.publicURL}
            fit="contain"
            width="90%"
            alt="Enlarged favorite wildlife image"
          />
        </div>
      </Modal>
    </>
  );
}
