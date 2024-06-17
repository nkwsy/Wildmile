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

import classes from "/styles/imagecard.module.css";

import { getAllDeployments } from "app/actions/CameratrapActions";
// Assuming this function is defined correctly and works as intended
/* Retrieves plant(s) data from mongodb database */

export function DeploymentCards(allDeployments) {
  const deployment_values = allDeployments.map((deployment) => ({
    id: deployment._id,
    locationName: deployment.locationId.locationName || "",
    camera: deployment.cameraId.name || "No Camera Assigned",
    // image: deployment.thumbnail,
    start: deployment.deploymentStart,
    end: deployment.familydeploymentEnd || "Live",
    tags: deployment.deploymentTags || "",
    // tags: plant.family, plant.family_common_name ?? null.filter(Boolean),
  }));
  return deployment_values;
}

export default async function AllDeployments() {
  const allDeployments = await getAllDeployments();
  const deployments = DeploymentCards(allDeployments);

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
        {deployments.map((deployment, index) => (
          <Card
            key={index}
            //   onClick={() => updateFormValues(plant)}
            withBorder
            padding="lg"
            radius="md"
            component={Link}
            href={`/cameratrap/deployment/edit/${deployment.id}`}

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
                <Title className={classes.title}>
                  {deployment.locationName}
                </Title>
                <Text
                  size="sm"
                  color="dimmed"
                  fs="italic"
                  c="dimmed"
                  className={classes.subtitle}
                >
                  {deployment.camera}
                </Text>
                {/* <Text size="sm" color="dimmed" className={classes.description}>
                  {plant.family}
                </Text> */}
                <Badge variant="light">{deployment.deploymentTags}</Badge>
              </div>
            </Group>
          </Card>
        ))}
      </SimpleGrid>
    </>
  );
}
