import { SimpleGrid, Title, Text, Container, Card, rem } from "@mantine/core";
import { IconListDetails, IconPlus } from "@tabler/icons-react";
import { useEffect } from "react";
import Router from "next/router";
import Link from "next/link";
import { useUser } from "/lib/hooks";
import { useRouter } from "next/router";
import dbConnect from "/lib/db/setup";
import Project from "/models/Project";
import Section from "/models/Section";
import { IconCardGrid } from "/components/icon_card_grid";

export default function ProjectLanding(props) {
  const router = useRouter();
  const [user, { loading }] = useUser();

  const section = JSON.parse(props.sections);
  console.log("section: " + section);
  const sections = section.map((section) => {
    return {
      icon: IconListDetails,
      title: section.name,
      href: `/projects/${router.query.id}/sections/${section.name}`,
      description: section.description,
    };
  });

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace("/");
  }, [user, loading]);

  const cards = [
    {
      icon: IconPlus,
      title: "New Section",
      href: `/projects/${router.query.id}/sections/edit/new`,
      description: "Check Trash Info",
    },
  ];

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} ta="center" mt="sm">
          {router.query.id}
        </Title>
        <Text c="dimmed" ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <SimpleGrid mt={40} cols={2}>
          <IconCardGrid cards={cards} />
          <Link href={"/projects/" + router.query.id + "/sections"}></Link>
          <IconCardGrid cards={sections} />
        </SimpleGrid>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  await dbConnect();
  // const logId = context.params.id
  const id = context.params.id; // Get the id from the request parameters
  console.log("id" + id);
  /* find all the data in our database */
  const project = await Project.findOne({ name: id, deleted: false });
  const projects = JSON.stringify(project);
  console.log(project._id);
  const section = await Section.find({
    projectId: project._id,
  });
  const sections = JSON.stringify(section);

  console.log(projects + sections);
  return { props: { projects: projects, sections: sections } };
}
