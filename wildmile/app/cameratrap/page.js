"use server";
import React, { Suspense } from "react";
import {
  Title,
  Text,
  Container,
  Button,
  Grid,
  GridCol,
  Fieldset,
  Loader,
} from "@mantine/core";
import { IconCardGrid } from "/components/icon_card_grid";
import classes from "/styles/card.module.css";
import {
  IconUsers,
  IconPokeball,
  IconCameraSearch,
  IconCameraPlus,
  IconZoomIn,
  IconMapPin,
} from "@tabler/icons-react";
// import TaxaSearch, { WildlifeSidebar } from "components/cameratrap/TaxaSearch";
import { RandomFavorite } from "components/cameratrap/RandomFavorite";
import InfoComponent from "components/cameratrap/InfoComponent";
import { UserInfoServer } from "components/cameratrap/UserInfoServer";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";
import { updateUserStats } from "app/actions/UserActions";
// In your page component:

function CameraTrapCards() {
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
    {
      icon: IconUsers,
      title: "Analytics",
      href: "/cameratrap/analytics",
      description: "See analytics on the camera trap project",
    },
  ];

  return <IconCardGrid cards={cards} />;
}

async function CameraTrapMgmtCards() {
  const session = await getSession({ headers });
  const user = await session;
  console.log(user);

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
    {
      icon: IconMapPin,
      title: "Locations",
      href: "/cameratrap/locations",
      description: "Manage the deployment locations",
    },
  ];

  // if (!user || !user.roles?.includes("CameraManager")) {
  // if (!user) {
  //   return null;
  // }

  return (
    <>
      {user && (
        <Fieldset legend="Management Tools">
          <IconCardGrid cards={cards} />
        </Fieldset>
      )}
    </>
  );
}

export default async function Page() {
  const session = await getSession({ headers });
  const user = await session;

  // Only fetch stats if we have a logged in user
  const userStats = user?._id ? await updateUserStats(user._id) : null;

  return (
    <>
      <Container maw="85%" my="5rem">
        <Grid mt="xl">
          <GridCol span={{ base: 12, md: 7 }}>
            <Title order={2} className={classes.title} ta="center" mt="sm">
              Camera Trap Resources
            </Title>
            <Text c="dimmed" ta="center" mt="md">
              Collecting and sharing data about Urban River's projects.
            </Text>
            <CameraTrapCards />
            <Suspense fallback={<Text>loading</Text>}>
              <CameraTrapMgmtCards />
            </Suspense>
          </GridCol>
          <GridCol span={{ base: 12, md: 5 }}>
            <Suspense fallback={<Text>loading</Text>}>
              <RandomFavorite />
            </Suspense>
            <Suspense fallback={<Text>loading</Text>}>
              <InfoComponent />
            </Suspense>
            <Suspense fallback={<Text>loading</Text>}>
              <UserInfoServer user={user} stats={userStats} />
            </Suspense>
          </GridCol>
          <GridCol span={5}></GridCol>
        </Grid>
      </Container>
    </>
  );
}
