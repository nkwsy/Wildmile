"use client";

import { useState } from "react";
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
import { IconRefresh, IconMaximize } from "@tabler/icons-react";
import classes from "styles/CameraTrap.module.css";

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

  useState(() => {
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
    <>
      <Fieldset legend="Random Favorite">
        <LoadingOverlay visible={loading} />
        {favoriteImage && (
          <div style={{ position: "relative", minHeight: 300 }}>
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
                Favorite by: {favoriteImage.favoriteUsers[0].profile.name}
              </Text>
              <Button
                mt="md"
                // flex="1"
                wrap="wrap"
                variant="light"
                color="blue"
                onClick={fetchRandomFavorite}
                loading={loading}
                leftSection={<IconRefresh />}
              >
                New Image
              </Button>
            </Flex>
            {/* </Group> */}
          </div>
        )}
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
