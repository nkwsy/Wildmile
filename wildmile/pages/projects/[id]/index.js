import { SimpleGrid, Title, Text, Container, Card, rem } from "@mantine/core";
import { IconListDetails } from "@tabler/icons-react";
import { useEffect } from "react";
import Router from "next/router";
import Link from "next/link";
import { useUser } from "/lib/hooks";
import { useRouter } from "next/router";
import dbConnect from "/lib/db/setup";

export default function ProjectLanding() {
  const router = useRouter();
  const [user, { loading }] = useUser();

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace("/");
  }, [user, loading]);

  return (
    <>
      <Container maw="85%" my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">
          {router.query.id}
        </Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <SimpleGrid mt={40} cols={2}>
          <Link href={"/projects/" + router.query.id + "/sections"}>
            <Card shadow="md" radius="md" className={classes.card} padding="xl">
              <IconListDetails
                size={rem(50)}
                stroke={2}
                color={theme.fn.primaryColor()}
              />
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                Sections
              </Text>
              <Text fz="sm" c="dimmed" mt="sm">
                View and Edit sections for this project
              </Text>
            </Card>
          </Link>
        </SimpleGrid>
      </Container>
    </>
  );
}

export async function getServerSideProps(context) {
  await dbConnect();
  // const logId = context.params.id
  const id = context.params.id; // Get the id from the request parameters
  console.log("id" + id);
  /* find all the data in our database */
  const result = await TrashItem.find({ deleted: false }, [
    "-creator",
    "-__v",
    "-createdAt",
    "-updatedAt",
    "-deleted",
  ])
    .populate({
      path: "individualTrashItem",
      // match: { logId: mongoose.Types.ObjectId(id) },
      match: { logId: id },
      model: "IndividualTrashItem",
      select: "-__v -createdAt -updatedAt -deleted -creator",
    })
    .lean();

  const items = result.reduce((acc, doc) => {
    const item = doc; //.toObject()
    item._id = item._id.toString();

    // If an IndividualTrashItem was found, add its quantity to the item
    if (item.individualTrashItem) {
      // item.individualTrashItem._id = item.individualTrashItem._id.toString();
      item.individualTrashItem._id = item.individualTrashItem._id.toString();
      item.individualTrashItem.itemId =
        item.individualTrashItem.itemId.toString();
      item.individualTrashItem.logId =
        item.individualTrashItem.logId.toString();
      item.quantity = item.individualTrashItem.quantity;
      // item.weight = item.individualTrashItem.weight; // Add this line if you also want to include weight
    } else {
      item.quantity = 0; // Default quantity
      // item.weight = 0; // Default weight
    }

    // Remove the individualTrashItem property from the item
    delete item.individualTrashItem;
    // Use the _id of the item as the key
    acc[item._id] = item;
    return acc;
  }, {});

  console.log(items);
  return { props: { items: items, logId: id } };
}
