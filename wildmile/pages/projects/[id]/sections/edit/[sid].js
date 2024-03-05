import React, { useRef, useEffect, useState } from "react";
import { Title, Text, Container, Group, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { IconListDetails } from "@tabler/icons-react";
import Router from "next/router";
import { useUser } from "/lib/hooks";
import dbConnect from "/lib/db/setup";
import { useDisclosure } from "@mantine/hooks";
import Section from "/models/Section";
import Project from "/models/Project";
import { cardStyles, IconCardGrid } from "/components/icon_card_grid";
import ModuleForm from "components/projects/module_form";

export default function EditSection(props) {
  // const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");
  const [active, setActive] = useState(0);
  const [user, { loading }] = useUser();
  const [visible, handlers] = useDisclosure(false);

  console.log("Project:", props);
  console.log("project_id:", props.project._id);
  // useEffect(() => {
  //   // redirect user to login if not authenticated
  //   if (!loading && !user) Router.replace("/");
  // }, [user, loading]);
  const project = JSON.parse(props.project);

  const form = useForm({
    initialValues: {
      name: "",
      description: "",
      dateInstalled: new Date(),
      notes: "",
      size: { x: 0, y: 0 },
      projectId: project._id,
    },
  });
  async function updateSection() {
    console.log("Form state on submit:", form);
    handlers.open();
    const res = await fetch("/api/project/sections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.values),
    });
    if (res.status === 201) {
      const data = await res.json();
      console.log("Data:", data);
      Router.push(`/projects/`);
    } else {
      handlers.close();
      setErrorMsg(await res.text());
    }
    // if (res.status === 201) {
    //   Router.push("/projects");
    // } else {
    //   handlers.close();
    //   setErrorMsg(await res.text());
    // }
    // Router.push("/projects/" + props.project.name + "/sections");
  }
  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} ta="center" mt="sm">
          Edit Section
        </Title>
        <Text c="dimmed" ta="center" mt="md">
          Sections for this project
        </Text>
        <ModuleForm form={form} />
        <Group justify="right">
          <Button onClick={updateSection} color="blue">
            Save
          </Button>
        </Group>
      </Container>
    </>
  );
}

/* Retrieves plant(s) data from mongodb database */
export async function getServerSideProps(context) {
  await dbConnect();
  const section_id = context.params.sid;
  const project_name = decodeURIComponent(context.params.id);
  const this_project = JSON.stringify(
    await Project.findOne({ name: project_name })
  );
  if (section_id === "new") {
    const this_section = [];
    return { props: { project: this_project, section: this_section } };
  } else {
    const result = await Section.findById({ section_id }, [
      "-createdAt",
      "-updatedAt",
    ]);

    const this_section = result.map((doc) => {
      const section = doc.toObject();
      section._id = String(section._id);
      section.project = String(section.project);
      return section;
    });

    return { props: { project: this_project, section: this_section } };
  }
}
