import {
  Table,
  TableTh,
  TableThead,
  TableTr,
  TableTbody,
  TableTd,
  Text,
  Button,
  Group,
  Container,
} from "@mantine/core";
import Link from "next/link";
import { unstable_cache } from "next/cache";

import { getCameras } from "app/actions/CameratrapActions";
// Assuming this function is defined correctly and works as intended
/* Retrieves plant(s) data from mongodb database */

export function CameraCards(allCameras) {
  const camera_values = allCameras
    .map((camera) => ({
      id: camera._id,
      name: camera.name || "No Camera Assigned",
      connectivity: camera.connectivity || "",
      model: camera.model || "",
      manufacturer: camera.manufacturer || "",
      tags: camera.cameraTags || "",
      actions: {
        edit: `/cameratrap/camera/${camera._id}/edit`,
        view: `/cameratrap/camera/${camera._id}`,
      },
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
  return camera_values;
}

export default async function AllCameras() {
  const allCameras = await unstable_cache(
    async () => getCameras(),
    ["cameras"],
    {
      tags: ["cameras"],
      revalidate: 36000,
    }
  )();
  const cameras = CameraCards(allCameras);

  return (
    <Container>
      <Text size="xl" fw={700} mb="md">
        All Cameras
      </Text>
      <Table striped highlightOnHover>
        <TableThead>
          <TableTr>
            <TableTh>Camera Name</TableTh>
            <TableTh>Manufacturer</TableTh>
            <TableTh>Model</TableTh>
            <TableTh>Connectivity</TableTh>
            <TableTh>Actions</TableTh>
          </TableTr>
        </TableThead>
        <TableTbody>
          {cameras.map((camera) => (
            <TableTr key={camera.id}>
              <TableTd>{camera.name}</TableTd>
              <TableTd>{camera.manufacturer}</TableTd>
              <TableTd>{camera.model}</TableTd>
              <TableTd>{camera.connectivity}</TableTd>
              <TableTd>
                <Group gap="xs">
                  <Link href={camera.actions.edit}>
                    <Button variant="light" size="xs">
                      Edit
                    </Button>
                  </Link>
                </Group>
              </TableTd>
            </TableTr>
          ))}
        </TableTbody>
      </Table>
    </Container>
  );
}
