import {
  Title,
  Text,
  Container,
  Grid,
  Button,
  TextInput,
  Textarea,
  GridCol,
  Flex,
  Box,
  Group,
  NumberInput,
  OptionalPortal,
  Affix,
  Portal,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconListDetails } from "@tabler/icons-react";
import { Router, useRouter } from "next/navigation";
import { useUser } from "/lib/hooks";
import dbConnect from "/lib/db/setup";
import Section from "/models/Section";
import Module from "/models/Module";
import { cardStyles, IconCardGrid } from "/components/icon_card_grid";
import { get } from "mongoose";
import { ClientProvider, useClient } from "components/projects/context_mod_map";
// import ModuleGrid from "components/projects/mod_util";
import {
  // BaseGrid,
  CreateGridLayer,
  // CreateModuleLayer,
  CanvasBase,
  ModMapWrapper,
} from "components/projects/canvas_base";
import { PlantMap } from "components/projects/plant_map";
import dynamic from "next/dynamic";

import "passport";
import React from "react";
const ModuleToolbar = dynamic(() => import("components/projects/module_form"), {
  ssr: false,
});

// import ModMap from "components/projects/3_map";
// import { string } from "yup";
// import { stringify } from "postcss";
// import { BaseGrid, createRectLayer } from "components/projects/base_grid";
// const CreateGridLayer = dynamic(
//   () => import("components/projects/canvas_base"),
//   {
//     // ssr: false,
//   }
// );
// const CanvasBase = dynamic(() => import("components/projects/canvas_base"), {
//   // ssr: false,
// });

// const ModMapWrapper = dynamic(() => import("components/projects/canvas_base"), {
//   // ssr: false,
// });

// import { addModule } from "components/projects/mod_map";

export default async function Page(context) {
  const raw_modules = await getModules(context);
  // const modules = JSON.parse(raw_modules.modules);
  const section = JSON.parse(raw_modules.section);
  console.log("Modules:", section);
  // const modules = props.modules.map((module) => {
  //   return {
  //     icon: IconListDetails,
  //     title: `Model: ${module.model} - Shape: ${module.shape} X: ${module.x}, Y: ${module.y}`,
  //     href: `/projects/${router.query.id}/modules/${module._id}`,
  //     description: module.notes,
  //   };
  // });
  // const mod_form = useForm({
  //   initialValues: {
  //     model: "",
  //     size: {
  //       x: 0,
  //       y: 0,
  //     },
  //     notes: "",
  //     dateInstalled: new Date(),
  //   },
  // });
  return (
    <>
      <Title
        order={2}
        ta="right"
        mt="sm"
      >{`${context.params.project} ${context.params.section}'s Modules`}</Title>
      <Portal>
        <ModMapWrapper>
          <Box sx={{ position: "relative", width: "100%", height: "500px" }}>
            {/* <Box
            // component="canvas"
            width="100%"
            height="500"
            sx={{ display: "block", width: "100%", height: "100%" }}
          > */}
            <CanvasBase width={section.size.width} height={section.size.length}>
              <CreateGridLayer />
              <PlantMap />
              {/* <CreateModuleLayer modules={modules} /> */}
            </CanvasBase>
            {/* </Box> */}
            <Affix position={{ top: 100, right: 20 }}>
              <Group
                position="apart"
                sx={{
                  position: "absolute",
                  top: 10, // Adjust the position as needed
                  left: 10, // Adjust the position as needed
                  zIndex: 10, // Ensure the toolbar is above other content
                }}
              >
                <ModuleToolbar />
              </Group>
            </Affix>
          </Box>
        </ModMapWrapper>
      </Portal>
    </>
  );
}

{
  /* // <ModMapWrapper> */
}
//   {/* <Grid justify="flex-end" overflow="hidden" maw="100%">
//       <GridCol span={4} pos={"fixed"} justify="flex-end" flex miw={200}> */}
//   <Flex
//     mih={10}
//     gap="md"
//     justify="flex-end"
//     align="flex-start"
//     direction={{ base: "column", sm: "row" }}
//     wrap="wrap"
//   >
//     <ModuleToolbar />
//     {/* </GridCol> */}
//     <CanvasBase width={12} height={200}>
//       {/* <CreateGridLayer /> */}
//       <CreateModuleLayer modules={modules} />
//     </CanvasBase>
//   </Flex>
//   {/* </Grid> */}
// </ModMapWrapper>
// {/* </Container> */}

/* Retrieves plant(s) data from mongodb database */
export async function getModules(context) {
  const section_name = context.params.section;
  await dbConnect();

  if (section_name === "new") {
    return { props: { modules: [] } };
  }

  const section = await Section.findOne({ name: section_name }).lean();
  // const result = await Module.find({ sectionId: section._id }).lean();

  // const modules = JSON.stringify(result);
  const section_json = JSON.stringify(section);
  // const modules = result.map((doc) => {
  //   const module = doc.toObject();
  //   module._id = String(module._id);
  //   module.section = String(module.section);
  //   return module;
  // });
  const returns = {
    // modules: modules,
    section: section_json,
  };
  return returns;
}
