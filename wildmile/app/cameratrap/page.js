"use server";
import React, { Suspense } from "react";
import {
  Title,
  Text,
  Container,
  Grid,
  GridCol,
  Fieldset,
  Loader,
} from "@mantine/core";
import { IconCardGrid } from "/components/icon_card_grid";
import classes from "/styles/card.module.css";
import {
  IconAbacus,
  IconUsers,
  IconPokeball,
  IconCameraSearch,
  IconCameraPlus,
  IconZoomIn,
  IconMapPin,
} from "@tabler/icons-react";
import { RandomFavorite } from "components/cameratrap/RandomFavorite";
import InfoComponent from "components/cameratrap/InfoComponent";
import { UserInfoServer } from "components/cameratrap/UserInfoServer";
import { getSession } from "lib/getSession";
import { headers } from "next/headers";

const cameraTrapCards = [
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
    icon: IconAbacus,
    title: "Analytics",
    href: "/cameratrap/analytics/total-images",
    description: "See analytics on the camera trap project",
  },
];

const mgmtCards = [
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

export default async function Page() {
  const user = await getSession({ headers });

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
            <IconCardGrid cards={cameraTrapCards} />
            {user && (
              <Fieldset legend="Management Tools">
                <IconCardGrid cards={mgmtCards} />
              </Fieldset>
            )}
          </GridCol>
          <GridCol span={{ base: 12, md: 5 }}>
            <Suspense fallback={<Loader size="sm" />}>
              <RandomFavorite />
            </Suspense>
            <Suspense fallback={<Loader size="sm" />}>
              <InfoComponent />
            </Suspense>
            <Suspense fallback={<Loader size="sm" />}>
              <UserInfoServer user={user} />
            </Suspense>
          </GridCol>
          <GridCol span={5}></GridCol>
        </Grid>
      </Container>
    </>
  );
}
