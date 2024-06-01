// "use client";
import { Title, Text, Container, Button } from "@mantine/core";

import { IconCardGrid } from "/components/icon_card_grid";
import classes from "/styles/card.module.css";
import Link from "next/link";
import {
  IconTrash,
  IconPlant2,
  IconListDetails,
  IconUsers,
  IconBackhoe,
} from "@tabler/icons-react";
import TaxaSearch, { WildlifeSidebar } from "components/cameratrap/TaxaSearch";

export default async function Page() {
  // const { classes, theme } = cardStyles()
  // const [user, { loading }] = useUser();
  // useEffect(() => {
  //   // redirect user to login if not authenticated
  //   if (!loading && !user) Router.replace("/");
  // }, [user, loading]);

  const cards = [
    // standin for other links
    {
      icon: IconPlant2,
      title: "New Camera",
      href: "/cameratrap/camera/new",
      description: "Add a new camera device",
    },
    {
      icon: IconTrash,
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
      icon: IconBackhoe,
      title: "New Deployment",
      href: "/cameratrap/deployment/edit/new",
      description: "Create a new deployment",
    },
  ];

  // user && user.admin
  //   ? cards.push({
  //       icon: IconBackhoe,
  //       title: "New Project",
  //       href: "/projects/project/new",
  //       description: "Create a new project",
  //     })
  //   : null;

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Camera Trap Resources
        </Title>
        <Text c="dimmed" ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>

        <IconCardGrid cards={cards} />
        {/* <IconCardGrid cards={projects} />
        <Button component={Link} href="/projects/new">
          New Project
        </Button> */}
        {/* <TaxaSearch /> */}
        <WildlifeSidebar />
      </Container>
    </>
  );
}
