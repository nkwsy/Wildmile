"use client";
import { Title, Text, Container, Button, Grid } from "@mantine/core";
import { LoadingOverlay } from "@mantine/core";
import { useEffect } from "react";
import { IconCardGrid } from "/components/icon_card_grid";
import classes from "/styles/card.module.css";
import Link from "next/link";
import {
  IconUsers,
  IconBackhoe,
  IconPokeball,
  IconCameraSearch,
  IconCameraPlus,
} from "@tabler/icons-react";
// import TaxaSearch, { WildlifeSidebar } from "components/cameratrap/TaxaSearch";
import { useUser } from "lib/hooks";
import { useRouter } from "next/navigation";
import { RandomFavorite } from "components/cameratrap/RandomFavorite";

function CameraTrapCards({ user }) {
  const cards = [
    {
      icon: IconCameraPlus,
      title: "New Camera",
      href: "/cameratrap/camera/new",
      description: "Add a new camera device",
    },
    {
      icon: IconCameraSearch,
      title: "Cameras",
      href: "/cameratrap/camera",
      description: "Manage the cameras",
    },
    {
      icon: IconUsers,
      title: "Deployments",
      href: "/cameratrap/deployment",
      description: "Manage the deployments",
    },
    {
      icon: IconPokeball,
      title: "Identify wildlife",
      href: "/cameratrap/identify",
      description: "Find and catagorize wildlife",
    },
  ];
  if (user?.admin) {
    cards.push({
      icon: IconBackhoe,
      title: "New Project",
      href: "/projects/project/new",
      description: "Create a new project",
    });
  }

  return <IconCardGrid cards={cards} />;
}

export default function CameraTrapHomePage() {
  // const { classes, theme } = cardStyles()
  const { user, loading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) router.replace("/login");
    console.log(user);
  }, [user, loading, router]);

  if (loading) {
    return <LoadingOverlay visible />;
  }

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Camera Trap Resources
        </Title>
        <Text c="dimmed" ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>

        <Grid mt="xl">
          <Grid.Col span={6}>
            <CameraTrapCards user={user} />
          </Grid.Col>
          <Grid.Col span={6}>
            <RandomFavorite />
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}
