import { Title, Text, Container } from "@mantine/core";
import {
  IconClipboardPlus,
  IconCalendarSearch,
  IconChartInfographic,
} from "@tabler/icons-react";
import { IconCardGrid } from "../../components/icon_card_grid";
import classes from "/styles/card.module.css";

export default function Page() {
  const cards = [
    {
      icon: IconClipboardPlus,
      title: "Add New Trash Log",
      href: "/trash/log",
      description: "Create a new trash log ",
    },
    // {
    //   icon: IconCalendarSearch,
    //   title: "Past Logs",
    //   href: "/trash/history",
    //   description: "View and Edit previous trash logs",
    // },
    {
      icon: IconChartInfographic,
      title: "Trash Dashboard",
      href: "http://trashdash.urbanriv.org",
      description: "View trash data dashboard",
    },
  ];

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Urban River Trash Resources
        </Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <IconCardGrid cards={cards} />
      </Container>
    </>
  );
}
