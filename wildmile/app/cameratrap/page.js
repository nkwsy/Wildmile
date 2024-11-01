"use client";
import { Title, Text, Container, Button, Grid, Fieldset } from "@mantine/core";
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
  IconZoomIn,
} from "@tabler/icons-react";
// import TaxaSearch, { WildlifeSidebar } from "components/cameratrap/TaxaSearch";
import { useUser } from "lib/hooks";
import { useRouter } from "next/navigation";
import { RandomFavorite } from "components/cameratrap/RandomFavorite";
import { InfoComponent } from "components/cameratrap/InfoComponent";

function CameraTrapCards({ user }) {
  const cards = [
    {
      icon: IconPokeball,
      title: "Identify wildlife",
      href: "/cameratrap/identify",
      description:
        "Find and catagorize wildlife captured around the Chicago River",
    },
    {
      icon: IconZoomIn,
      title: "Explore Data",
      href: "/cameratrap/explore",
      description: "Explore wildlife images which have been catagorized",
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

function CameraTrapMgmtCards({ user }) {
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
      description: "Manage the camera inventory",
    },
    {
      icon: IconUsers,
      title: "Deployments",
      href: "/cameratrap/deployment",
      description: "Manage the deployments",
    },
  ];
  return <IconCardGrid cards={cards} />;
}

export default function CameraTrapHomePage() {
  // const { classes, theme } = cardStyles()
  const { user, loading } = useUser();
  const router = useRouter();

  // useEffect(() => {
  //   // redirect user to login if not authenticated
  //   if (!loading && !user) router.replace("/login");
  //   console.log(user);
  // }, [user, loading, router]);

  if (loading) {
    return <LoadingOverlay visible />;
  }

  return (
    <>
      <Container maw="85%" my="5rem">
        <Grid mt="xl">
          <Grid.Col span={7}>
            <Title order={2} className={classes.title} ta="center" mt="sm">
              Camera Trap Resources
            </Title>
            <Text c="dimmed" ta="center" mt="md">
              Collecting and sharing data about Urban River's projects.
            </Text>
            <CameraTrapCards user={user} />
            {user && (
              <Fieldset legend="Management Tools">
                <CameraTrapMgmtCards user={user} />
              </Fieldset>
            )}
          </Grid.Col>
          <Grid.Col span={5}>
            <RandomFavorite />
            <InfoComponent />
          </Grid.Col>
          <Grid.Col span={5}></Grid.Col>
        </Grid>
      </Container>
    </>
  );
}
