import {
  Title,
  Text,
  Container,
  Box,
  Paper,
  Grid,
  GridCol,
  Fieldset,
} from "@mantine/core";
import {
  IconTrash,
  IconPlant2,
  IconListDetails,
  IconUsers,
} from "@tabler/icons-react";

import { IconCardGrid } from "../components/icon_card_grid";
import classes from "/styles/card.module.css";
import RandomPlant from "../components/plants/RandomPlant";
export default function HomePage() {
  // const [user, { loading }] = useUser();

  // useEffect(() => {
  //   // redirect user to login if not authenticated
  //   if (!loading && !user) Router.replace("/");
  // }, [user, loading]);

  const cards = [
    {
      icon: IconTrash,
      title: "Trash",
      href: "/trash",
      description: "Check Trash Info",
    },
    {
      icon: IconPlant2,
      title: "Plants",
      href: "/plants",
      description: "Manage the plants on the wild mile",
    },
    // Projects is broken for the moment
    {
      icon: IconListDetails,
      title: "B.U.R.P.",
      href: "/burp",
      description: "See the Current Wild Mile Projects",
    },
  ];

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          Home Page
        </Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <Box mt="lg">
          <Grid>
            <GridCol span={{ base: 12, md: 6, lg: 6 }}>
              {/* <Box> */}
              <IconCardGrid cards={cards} />
              {/* </Box> */}
            </GridCol>
            <GridCol span={{ base: 12, md: 6, lg: 6 }}>
              <Fieldset legend="A Random Plant">
                <RandomPlant />
              </Fieldset>
            </GridCol>
          </Grid>
        </Box>
      </Container>
    </>
  );
}
