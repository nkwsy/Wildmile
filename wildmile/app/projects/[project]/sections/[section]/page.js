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

import dbConnect from "/lib/db/setup";
import Section from "/models/Section";
import Module from "/models/Module";
import { get } from "mongoose";
import { ClientProvider, useClient } from "components/projects/context_mod_map";
import dynamic from "next/dynamic";

// import ModuleGrid from "components/projects/mod_util";
import {
  // BaseGrid,
  CreateGridLayer,
  // CreateModuleLayer,
  CanvasBase,
  ModMapWrapper,
} from "components/projects/canvas_base";
import { PlantMap } from "components/projects/plant_map";
// import dynamic from "next/dynamic";

import "passport";
import React, { Children } from "react";
const ModuleToolbar = dynamic(() => import("components/projects/module_form"), {
  ssr: false,
});

// const CanvasComponent = dynamic(
//   () => import("components/projects/CanvasComponent"),
//   {
//     ssr: false,
//   }
// );

// const CreateRectLayer = dynamic(
//   () => import("components/projects/CreateRectLayer"),
//   {
//     ssr: false,
//   }
// );

// import { addModule } from "components/projects/mod_map";

export default async function Page(context) {
  const raw_modules = await getModules(context);
  // const modules = JSON.parse(raw_modules.modules);
  const section = JSON.parse(raw_modules.section);
  console.log("Modules:", section);

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
              {/* <PlantMap /> */}
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

/* Retrieves plant(s) data from mongodb database */
export async function getModules(context) {
  const section_name = context.params.section;
  await dbConnect();

  if (section_name === "new") {
    return { props: { modules: [] } };
  }
  const section = await Section.findOne({ name: section_name }).lean();
  const section_json = JSON.stringify(section);
  const returns = {
    // modules: modules,
    section: section_json,
  };
  return returns;
}
