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
// import { ClientProvider, useClient } from "components/projects/context_mod_map";
// import dynamic from "next/dynamic";

// // import ModuleGrid from "components/projects/mod_util";
// import {
//   // BaseGrid,
//   // CreateGridLayer,
//   // CreateModuleLayer,
//   // CanvasBase,
//   ModMapWrapper,
// } from "components/projects/canvas_base";
// import { PlantMap } from "components/projects/plant_map";

// import React, { Children } from "react";
// const ModuleToolbar = dynamic(() => import("components/projects/module_form"), {
//   ssr: false,
// });

// const CanvasBase = dynamic(() => import("components/projects/canvas_base"), {
//   ssr: false,
// });
// const CreateGridLayer = dynamic(
//   () =>
//     import("components/projects/canvas_base").then(
//       (mod) => mod.CreateGridLayer
//     ),
//   { ssr: false }
// );
// import ModuleToolbar from "components/projects/module_form";
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
import dbConnect from "lib/db/setup";

import Section from "models/Section";
import SectionPage from "./section-page";
import { cleanObject } from "lib/utils";

export async function getModules(section_name) {
  await dbConnect();
  await section_name;
  if (section_name === "new") {
    return { props: { modules: [] } };
  }
  const section = await Section.findOne({ name: section_name }).lean();
  // const section_clean = JSON.stringify(section);
  const section_clean = cleanObject(section);
  console.log("SectionClean:", section_clean);
  const returns = {
    // modules: modules,
    section: section_clean,
  };
  return await returns;
}

export default async function Page({ params }) {
  const { project, section } = await params;

  try {
    const sectionData = await getModules(section);
    console.log("SectionData:", sectionData);
    // Serialize the section data
    const serializedSection = {
      ...sectionData.section,
      _id: sectionData.section._id.toString(),
      dateInstalled: sectionData.section.dateInstalled?.toISOString(),
    };
    await sectionData;
    return <SectionPage section={section} />;
  } catch (error) {
    console.error("Error loading section:", error);
    return <div>Error loading section data</div>;
  }
}
