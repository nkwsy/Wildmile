// "use server";
import { Title, Text, Container } from "@mantine/core";
import { IconPlant2 } from "@tabler/icons-react";
import { IconCardGrid } from "../../components/icon_card_grid";
import classes from "/styles/card.module.css";

import { cookies, headers } from "next/headers";

async function getData() {
  const authHeader = headers().get("authorization");
  console.log("Auth Header: ", authHeader);
  return "...";
}

export function PlantLanding() {
  const cards = [
    {
      icon: IconPlant2,
      title: "Plant Species",
      href: "/plants/species",
      description:
        "Species of the plants used in the locations and information about them",
    },
    {
      icon: IconPlant2,
      title: "Plant Observations",
      href: "/plants/observe",
      description: "Plants observed at locations",
    },
  ];

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Urban River Plants Resources
        </Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <IconCardGrid cards={cards} />
      </Container>
    </>
  );
}

export default async function Page() {
  // const session = await getSession();
  // const userRole = session?.user?.role; // Assuming 'role' is part of the session object
  // console.log("User Role: ", userRole);
  const data = await getData();
  console.log("Data: ", data);

  return <PlantLanding />;
}
//   if (userRole === 'admin') {
//     return <AdminDashboard /> // Component for admin users
//   } else if (userRole === 'user') {
//     return <UserDashboard /> // Component for regular users
//   } else {
//     return <AccessDenied /> // Component shown for unauthorized access
//   }
// }
