import { Title, Text, Container, Grid, Button } from "@mantine/core";
import { IconListDetails } from "@tabler/icons-react";
import { useEffect } from "react";
import { Router, useRouter } from "next/router";
import { useUser } from "../../../../lib/hooks";
import dbConnect from "../../../../lib/db/setup";
import Section from "../../../../models/Section";
import Module from "../../../../models/Module";
import {
  cardStyles,
  IconCardGrid,
} from "../../../../components/icon_card_grid";
// import ModuleGrid from "components/projects/mod_map";
// import ModMap from "components/projects/3_map";
import { string } from "yup";
import { stringify } from "postcss";
import dynamic from "next/dynamic";
// import { BaseGrid, createRectLayer } from "components/projects/base_grid";
// const ModuleGrid = dynamic(() => import("components/projects/mod_map"), {
//   ssr: false,
// });
const ModuleGrid = dynamic(() => import("components/projects/mod_map"));
import { addModule } from "components/projects/mod_map";

export default function ProjectSectionModulesLanding(props) {
  const router = useRouter();
  const [user, { loading }] = useUser();

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace("/");
  }, [user, loading]);

  const modules = JSON.parse(props.modules);
  console.log("modules: " + modules);
  // const modules = props.modules.map((module) => {
  //   return {
  //     icon: IconListDetails,
  //     title: `Model: ${module.model} - Shape: ${module.shape} X: ${module.x}, Y: ${module.y}`,
  //     href: `/projects/${router.query.id}/modules/${module._id}`,
  //     description: module.notes,
  //   };
  // });

  return (
    <>
      <Container maw="100%" my="5rem">
        <Title
          order={2}
          ta="right"
          mt="sm"
        >{`${router.query.id} ${router.query.sid}'s Modules`}</Title>
        <Grid>
          {/* <ModuleGrid modules={modules} width={20} height={200} /> */}
          <Grid.Col span={4}>
            {/* <Container size="sm" padding="md"> */}
            <ModuleGrid width={20} height={200} />
            {/* </Container> */}
          </Grid.Col>
          <Grid.Col span={8}>
            xxxx
            <Button onClick={addModule(modules)}>add module</Button>
          </Grid.Col>
        </Grid>
      </Container>
    </>
  );
}

/* Retrieves plant(s) data from mongodb database */
export async function getServerSideProps(context) {
  const section_name = context.params.sid;
  await dbConnect();

  if (section_name === "new") {
    return { props: { modules: [] } };
  }

  const section = await Section.findOne({ name: section_name });
  const result = await Module.find({ sectionId: section._id }).lean();

  const modules = JSON.stringify(result);
  // const modules = result.map((doc) => {
  //   const module = doc.toObject();
  //   module._id = String(module._id);
  //   module.section = String(module.section);
  //   return module;
  // });
  return { props: { modules: modules } };
}
