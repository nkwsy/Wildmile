import { SimpleGrid, Title, Text, Container, Card, rem } from "@mantine/core";
import { IconListDetails, IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import dbConnect from "/lib/db/setup";
import Project from "/models/Project";
import Section from "/models/Section";
import { IconCardGrid } from "/components/icon_card_grid";
import dynamic from "next/dynamic";

// const GeneratePDF = dynamic(() => import("/lib/pdfgen"), { ssr: false });
import { getPdf } from "/lib/pdfgen";

export default async function Page(context) {
  // const router = useRouter();
  const projectName = context.params.project;
  const sections = await getSections(projectName);
  const sectionCards = await (<IconCardGrid cards={sections.sections_card} />);
  // GeneratePDF("new2");
  getPdf();
  const cards = [
    {
      icon: IconPlus,
      title: "New Section",
      href: `/projects/${projectName}/sections/edit/new`,
      description: "Check Trash Info",
    },
  ];

  // console.log("sections: " + JSON.stringify(sections_card));
  return (
    <>
      <Container maw="100%" mah="100%" my="5rem">
        <Title order={2} ta="center" mt="sm">
          {projectName}
        </Title>
        <Text c="dimmed" ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <SimpleGrid mt={40} cols={2}>
          <IconCardGrid cards={cards} />
          <Link href={"/projects/" + projectName + "/sections"}></Link>
          {sectionCards}
        </SimpleGrid>
      </Container>
    </>
  );
}

export async function getSections(projectName) {
  // const pathname = usePathname();
  // console.log("pathname: " + pathname);
  await dbConnect();
  // const logId = context.params.id
  /* find all the data in our database */
  const project = await Project.findOne({ name: projectName, deleted: false });
  const projects = JSON.stringify(project);
  await console.log(projects);
  const project_id = await project._id;
  const section = await Section.find({
    projectId: project_id,
  });

  const sections_card = await section.map((section) => {
    return {
      icon: IconListDetails,
      title: section.name,
      href: `/projects/${projectName}/sections/${section.name}`,
      description: section.description,
    };
  });
  console.log("sections: " + JSON.stringify(sections_card));
  return { projects: projects, sections_card: sections_card };
}
