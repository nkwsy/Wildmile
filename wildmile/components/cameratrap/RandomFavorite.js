"use client";
import { useState, useEffect } from "react";
import {
  Card,
  Image,
  Text,
  Button,
  Group,
  LoadingOverlay,
  Modal,
  Fieldset,
} from "@mantine/core";
import { IconRefresh, IconMaximize } from "@tabler/icons-react";

export function RandomFavorite() {
  const [favoriteImage, setFavoriteImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enlargedImage, setEnlargedImage] = useState(false);

  const fetchRandomFavorite = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cameratrap/randomFavorite", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setFavoriteImage(data);
      }
    } catch (error) {
      console.error("Error fetching random favorite:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRandomFavorite();
  }, []);

  if (!favoriteImage && !loading) {
    return (
      <Card shadow="sm" padding="lg" radius="md" withBorder>
        <Text align="center">No favorite images found</Text>
      </Card>
    );
  }

  return (
    <Fieldset legend="A Random Image">
      <Card
        shadow="sm"
        padding="lg"
        radius="md"
        withBorder
        style={{ position: "relative" }}
      >
        <LoadingOverlay visible={loading} />
        <Card.Section>
          {favoriteImage && (
            <Image
              src={favoriteImage.publicURL}
              // height={300}
              alt="Random favorite wildlife image"
              style={{ objectFit: "contain" }}
            />
          )}
        </Card.Section>

        <Group position="apart" mt="md">
          <Text fw={500}>Random Favorite</Text>
          <Group spacing={5}>
            <Button
              variant="light"
              color="blue"
              size="sm"
              onClick={() => setEnlargedImage(true)}
            >
              <IconMaximize size={16} />
            </Button>
            <Button
              variant="light"
              color="blue"
              size="sm"
              onClick={fetchRandomFavorite}
              loading={loading}
            >
              <IconRefresh size={16} />
            </Button>
          </Group>
        </Group>

        {favoriteImage && (
          <Text size="sm" color="dimmed" mt="sm">
            Captured on: {new Date(favoriteImage.timestamp).toLocaleString()}
          </Text>
        )}

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
      </Card>
    </Fieldset>
  );
}
