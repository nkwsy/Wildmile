import {
  SimpleGrid,
  Text,
  Card,
  Image,
  Badge,
  Modal,
  Title,
  Container,
  TextInput,
  Textarea,
  Button,
  CardSection,
  Group,
  Chip,
  ChipGroup,
} from "@mantine/core";
import Link from "next/link";
import { unstable_cache } from "next/cache";

import classes from "/styles/imagecard.module.css";

import { getCameras } from "app/actions/CameratrapActions";
// Assuming this function is defined correctly and works as intended
/* Retrieves plant(s) data from mongodb database */

export function CameraCards(allCameras) {
  console.log(allCameras);
  const camera_values = allCameras.map((camera) => ({
    id: camera._id,
    // locationName: camera.locationId.locationName || "",
    name: camera.name || "No Camera Assigned",
    // image: camera.thumbnail,
    // start: camera.cameraStart,
    connectivity: camera.connectivity || "",
    model: camera.model || "",
    manufacturer: camera.manufacturer || "",
    tags: camera.cameraTags || "",
    // tags: plant.family, plant.family_common_name ?? null.filter(Boolean),
  }));
  return camera_values;
}

export default async function AllCameras() {
  const allCameras = await unstable_cache(
    async () => getCameras(),
    ["cameras"],
    {
      tags: ["cameras"],
      revalidate: 36000, // Cache for 1 hour unless invalidated
    }
  )();
  const cameras = CameraCards(allCameras);

  return (
    <>
      <SimpleGrid
        mt={40}
        cols={{ base: 2, sm: 2, lg: 5, xl: 4 }}
        breakpoints={[
          { maxWidth: "62rem", cols: 3, spacing: "md" },
          { maxWidth: "48rem", cols: 2, spacing: "sm" },
          { maxWidth: "36rem", cols: 1, spacing: "sm" },
        ]}
      >
        {cameras.map((camera, index) => (
          <Card
            key={index}
            //   onClick={() => updateFormValues(plant)}
            withBorder
            padding="lg"
            radius="md"
            component={Link}
            href={`/cameratrap/camera/${camera.id}`}

            //   className={classes.mantineCard}
          >
            <CardSection mb="sm">
              {/* <Image
                src={plant.image || "/No_plant_image.jpg"}
                alt={plant.title}
              /> */}
            </CardSection>

            <Group align="top" direction="column">
              <div>
                <Title className={classes.title}>{camera.name}</Title>
                <Text
                  size="sm"
                  color="dimmed"
                  fs="italic"
                  c="dimmed"
                  className={classes.subtitle}
                >
                  {camera.manufacturer} - {camera.model}
                </Text>
                {/* <Text size="sm" color="dimmed" className={classes.description}>
                    {plant.family}
                  </Text> */}
                <Badge variant="light">{camera.connectivity}</Badge>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
