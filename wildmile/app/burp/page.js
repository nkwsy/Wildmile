import { Title, Text, Container } from "@mantine/core";
// import { useEffect } from "react";
// import Router from "next/router";
// import { useUser } from "../../lib/hooks";
import { IconCardGrid } from "../../components/icon_card_grid";
import classes from "/styles/card.module.css";
import {
  IconTrash,
  IconPlant2,
  IconListDetails,
  IconUsers,
  IconBox,
  IconBackhoe,
  IconBugFilled,
  IconMicroscope,
  IconNewSection,
  IconButterfly,
  IconMap,
} from "@tabler/icons-react";

// import MapPicker from "components/map_picker";
export const metadata = {
  title: "B.U.R.P.  Bugs In Urban Rivers Project.",
  description: "Bugs In Urban Rivers Project.",
};
export default function BurpHomeLanding() {
  // const { user, loading }  = useUser();

  // useEffect(() => {
  //   // redirect user to login if not authenticated
  //   if (!loading && !user) Router.replace("/");
  // }, [user, loading]);

  const cards = [
    {
      icon: IconBox,
      title: "Samples",
      href: "/macros/samples",
      description: "Manage the samples",
    },
    {
      icon: IconButterfly,
      title: "Identify Bugs",
      href: "/burp/identify",
      description: "Manage the samples",
    },
    {
      icon: IconMicroscope,
      title: "Microscope",
      href: "/burp/microscope",
      description: "Manage the samples",
    },
    {
      icon: IconNewSection,
      title: "New Sample",
      href: "/burp/samples/new",
      description: "Create a new sample",
    },
    {
      icon: IconMap,
      title: "New Location",
      href: "/burp/locations",
      description: "Manage the locations",
    },
  ];
  // user && user.admin
  //   ? cards.push({
  //       icon: IconBackhoe,
  //       title: "New Project",
  //       href: "/burp/new",
  //       description: "Create a new project",
  //     })
  //   : null;

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} ta="center" mt="sm">
          B.U.R.P.
        </Title>
        <Text c="dimmed" ta="center" mt="md">
          Bugs In Urban Rivers Project.
        </Text>
        <IconCardGrid cards={cards} />
      </Container>
    </>
  );
}
