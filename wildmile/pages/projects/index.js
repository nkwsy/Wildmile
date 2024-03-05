import { Title, Text, Container } from "@mantine/core";
import { useEffect } from "react";
import Router from "next/router";
import { useUser } from "../../lib/hooks";
import Project from "../../models/Project";
import dbConnect from "../../lib/db/setup";
import { IconCardGrid } from "/components/icon_card_grid";
import classes from "/styles/card.module.css";
import {
  IconTrash,
  IconPlant2,
  IconListDetails,
  IconUsers,
  IconBackhoe,
} from "@tabler/icons-react";
import MapPicker from "components/map_picker";

export default function ProjectHomeLanding(props) {
  // const { classes, theme } = cardStyles()
  const [user, { loading }] = useUser();

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace("/");
  }, [user, loading]);

  const cards = [
    // standin for other links
    {
      icon: IconPlant2,
      title: "Plants",
      href: "/plants",
      description: "Manage the plants on the wild mile",
    },
  ];
  user && user.admin
    ? cards.push({
        icon: IconBackhoe,
        title: "New Project",
        href: "/projects/project/new",
        description: "Create a new project",
      })
    : null;

  const ProjectCards = props.projects.map((project) => {
    return {
      icon: IconListDetails,
      title: project.name,
      href: `/projects/${encodeURIComponent(project.name)}`,
      description: project.description,
    };
  });

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Project Home Page
        </Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <IconCardGrid cards={cards} />
        <IconCardGrid cards={ProjectCards} />
        <MapPicker />
      </Container>
    </>
  );
}

/* Retrieves plant(s) data from mongodb database */
export async function getStaticProps() {
  await dbConnect();

  /* find all the data in our database */
  const result = await Project.find({}, ["-_id", "name", "description"]);
  const projects = result.map((doc) => {
    const project = doc.toObject();
    return project;
  });
  console.log(projects);
  return { props: { projects: projects } };
}
