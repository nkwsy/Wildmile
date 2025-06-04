"use client";
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

import React, { Children } from "react";
const ModuleToolbar = dynamic(() => import("components/projects/module_form"), {
  ssr: false,
});

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
import { useState, useEffect } from "react";

export default function SectionPage({ section }) {
  const [sectionData, setSectionData] = useState(null);

  useEffect(() => {
    async function fetchSectionData() {
      const response = await fetch(`/api/projects/section/${section}`);
      const data = await response.json();
      setSectionData(data);
    }
    fetchSectionData();
  }, []);
  if (!sectionData) {
    return <div>Loading...</div>;
  }
  console.log("SectionPage:", sectionData);
  return (
    <>
      <CanvasBase
        width={sectionData.size.width}
        height={sectionData.size.length}
      >
        <CreateGridLayer />
        {/* <PlantMap /> */}
        {/* <CreateModuleLayer modules={section.modules} /> */}
      </CanvasBase>
      <Affix position={{ top: 100, right: 20 }}>
        <Group
          position="apart"
          align="flex-start"
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
    </>
  );
}
