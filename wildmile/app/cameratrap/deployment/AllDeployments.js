"use client";
import { useEffect, useState } from "react";
import {
  SimpleGrid,
  Text,
  Card,
  Badge,
  Title,
  Container,
  Group,
  Stack,
  LoadingOverlay,
  Divider,
  Tooltip,
  ActionIcon,
  Menu,
  TextInput,
} from "@mantine/core";
import {
  IconMapPin,
  IconCamera,
  IconCalendar,
  IconTag,
  IconDots,
  IconEdit,
  IconTrash,
} from "@tabler/icons-react";
import Link from "next/link";
import DeploymentMap from "components/cameratrap/deployments/DeploymentMap";
import classes from "/styles/imagecard.module.css";
import { DataTable } from "mantine-datatable";

const DeploymentCard = ({ deployment }) => (
  <Card
    key={deployment.id}
    withBorder
    padding="xs"
    radius="md"
    component={Link}
    href={`/cameratrap/deployment/edit/${deployment.id}`}
    className={classes.card}
  >
    <Stack spacing={8}>
      {/* Header: Location name + status */}
      <Group position="apart" align="start" noWrap>
        <Tooltip label={deployment.locationName} multiline width={220}>
          <Title order={4} lineClamp={1} className={classes.title}>
            {deployment.locationName}
          </Title>
        </Tooltip>
        <Badge
          size="sm"
          variant="light"
          color={deployment.isActive ? "green" : "gray"}
        >
          {deployment.isActive ? "Active" : "Inactive"}
        </Badge>
      </Group>

      {/* Location details */}
      {(deployment.projectArea || deployment.zone) && (
        <Group spacing={4} noWrap>
          <IconMapPin size={14} stroke={1.5} />
          <Text size="xs" c="dimmed" lineClamp={1}>
            {[deployment.projectArea, deployment.zone]
              .filter(Boolean)
              .join(" - ")}
          </Text>
        </Group>
      )}

      {/* Camera details */}
      <Group spacing={4} noWrap>
        <IconCamera size={14} stroke={1.5} />
        <Stack spacing={0}>
          <Text size="sm" lineClamp={1}>
            {deployment.camera}
          </Text>
          {deployment.cameraModel && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {deployment.cameraModel}
              {deployment.serialNumber && ` (${deployment.serialNumber})`}
            </Text>
          )}
        </Stack>
      </Group>

      {/* Dates */}
      <Group spacing={4} noWrap>
        <IconCalendar size={14} stroke={1.5} />
        <Text size="xs">
          {new Date(deployment.start).toLocaleDateString()}
          {deployment.end
            ? ` - ${new Date(deployment.end).toLocaleDateString()}`
            : " - Present"}
        </Text>
      </Group>

      {/* Footer: Tags + Setup info */}
      <Group position="apart" align="end">
        {deployment.tags.length > 0 && (
          <Group spacing={4} noWrap>
            <IconTag size={14} stroke={1.5} />
            <Group spacing={4} noWrap>
              {deployment.tags.slice(0, 2).map((tag, i) => (
                <Badge key={i} size="xs" variant="light" radius="sm">
                  {tag}
                </Badge>
              ))}
              {deployment.tags.length > 2 && (
                <Tooltip
                  label={deployment.tags.slice(2).join(", ")}
                  multiline
                  width={200}
                >
                  <Badge size="xs" variant="light" radius="sm">
                    +{deployment.tags.length - 2}
                  </Badge>
                </Tooltip>
              )}
            </Group>
          </Group>
        )}
        {deployment.setupBy && (
          <Text size="xs" c="dimmed">
            By: {deployment.setupBy}
          </Text>
        )}
      </Group>

      {/* Comments tooltip */}
      {deployment.comments && (
        <Tooltip label={deployment.comments} multiline width={200}>
          <Text size="xs" c="dimmed" lineClamp={1}>
            {deployment.comments}
          </Text>
        </Tooltip>
      )}
    </Stack>
  </Card>
);

export default function AllDeployments() {
  const [deployments, setDeployments] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [sortStatus, setSortStatus] = useState({
    columnAccessor: "locationName",
    direction: "asc",
  });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editedRecord, setEditedRecord] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [deploymentsRes, locationsRes] = await Promise.all([
          fetch("/api/cameratrap/deployments"),
          fetch("/api/cameratrap/deploymentLocations"),
        ]);

        const [deploymentsData, locationsData] = await Promise.all([
          deploymentsRes.json(),
          locationsRes.json(),
        ]);

        setDeployments(deploymentsData);
        setLocations(locationsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const deploymentCards = deployments.map((deployment) => ({
    id: deployment._id,
    // Location info
    locationName: deployment.locationId?.locationName || "Unknown Location",
    projectArea: deployment.locationId?.projectArea,
    zone: deployment.locationId?.zone,
    coordinates: deployment.locationId?.location?.coordinates,
    // Camera info
    camera: deployment.cameraId?.name || "No Camera Assigned",
    cameraModel: deployment.cameraId?.model,
    serialNumber: deployment.cameraId?.serialNumber,
    // Deployment details
    start: deployment.deploymentStart,
    end: deployment.deploymentEnd,
    setupBy: deployment.setupBy,
    cameraHeight: deployment.cameraHeight,
    cameraTilt: deployment.cameraTilt,
    cameraHeading: deployment.cameraHeading,
    habitat: deployment.habitat,
    featureType: deployment.featureType,
    tags: deployment.deploymentTags || [],
    comments: deployment.deploymentComments,
    isActive: !deployment.deploymentEnd,
  }));

  const columns = [
    {
      accessor: "locationName",
      title: "Location",
      render: (record) => (
        <Tooltip label={record.locationName} multiline width={220}>
          <Text lineClamp={1}>{record.locationName}</Text>
        </Tooltip>
      ),
    },
    {
      accessor: "camera",
      title: "Camera",
      render: (record) => (
        <Stack spacing={0}>
          <Text lineClamp={1}>{record.camera}</Text>
          {record.cameraModel && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {record.cameraModel}
              {record.serialNumber && ` (${record.serialNumber})`}
            </Text>
          )}
        </Stack>
      ),
    },
    {
      accessor: "dates",
      title: "Deployment Period",
      render: (record) => (
        <Text size="sm">
          {new Date(record.start).toLocaleDateString()}
          {record.end
            ? ` - ${new Date(record.end).toLocaleDateString()}`
            : " - Present"}
        </Text>
      ),
    },
    {
      accessor: "status",
      title: "Status",
      render: (record) => (
        <Badge
          size="sm"
          variant="light"
          color={record.isActive ? "green" : "gray"}
        >
          {record.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      accessor: "projectArea",
      title: "Project Area",
      render: (record) => {
        if (editingId === record.id) {
          return (
            <TextInput
              value={editedRecord.projectArea || ""}
              onChange={(e) =>
                setEditedRecord({
                  ...editedRecord,
                  projectArea: e.target.value,
                })
              }
            />
          );
        }
        return <Text>{record.projectArea || "-"}</Text>;
      },
    },
    {
      accessor: "zone",
      title: "Zone",
      render: (record) => {
        if (editingId === record.id) {
          return (
            <TextInput
              value={editedRecord.zone || ""}
              onChange={(e) =>
                setEditedRecord({ ...editedRecord, zone: e.target.value })
              }
            />
          );
        }
        return <Text>{record.zone || "-"}</Text>;
      },
    },
    {
      accessor: "tags",
      title: "Tags",
      render: (record) => {
        if (editingId === record.id) {
          return (
            <TextInput
              value={editedRecord.tags.join(", ")}
              onChange={(e) =>
                setEditedRecord({
                  ...editedRecord,
                  tags: e.target.value
                    .split(",")
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
              placeholder="Comma-separated tags"
            />
          );
        }
        return (
          <Group spacing={4}>
            {record.tags.map((tag, i) => (
              <Badge key={i} size="xs" variant="light">
                {tag}
              </Badge>
            ))}
          </Group>
        );
      },
    },
    {
      accessor: "comments",
      title: "Comments",
      render: (record) => {
        if (editingId === record.id) {
          return (
            <TextInput
              value={editedRecord.comments || ""}
              onChange={(e) =>
                setEditedRecord({ ...editedRecord, comments: e.target.value })
              }
            />
          );
        }
        return (
          <Tooltip label={record.comments} multiline width={200}>
            <Text lineClamp={1}>{record.comments || "-"}</Text>
          </Tooltip>
        );
      },
    },
    {
      accessor: "actions",
      title: "",
      render: (record) => (
        <Menu position="bottom-end" withinPortal>
          <Menu.Target>
            <ActionIcon variant="subtle">
              <IconDots size={16} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              component={Link}
              href={`/cameratrap/deployment/edit/${record.id}`}
              leftSection={<IconEdit size={14} />}
            >
              Edit
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      ),
    },
  ];

  const sortedRecords = [
    ...(isAddingNew ? [...deploymentCards, newDeployment] : deploymentCards),
  ].sort((a, b) => {
    const { columnAccessor, direction } = sortStatus;

    let compareA = a[columnAccessor] ?? "";
    let compareB = b[columnAccessor] ?? "";

    // Special handling for dates column
    if (columnAccessor === "dates") {
      compareA = new Date(a.start || "").getTime();
      compareB = new Date(b.start || "").getTime();
    }

    // Handle string comparison
    if (typeof compareA === "string") {
      compareA = compareA.toLowerCase();
      compareB = compareB.toLowerCase();
    }

    if (compareA < compareB) {
      return direction === "asc" ? -1 : 1;
    }
    if (compareA > compareB) {
      return direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  return (
    <Container size="xl" pos="relative">
      <LoadingOverlay visible={loading} />
      <Stack spacing="xl">
        <DeploymentMap locations={locations} />
        <LocationDrawer />
        <DataTable
          withBorder
          borderRadius="sm"
          withColumnBorders
          striped
          highlightOnHover
          records={sortedRecords}
          selectedRecords={selectedRecords}
          onSelectedRecordsChange={setSelectedRecords}
          sortStatus={sortStatus}
          onSortStatusChange={setSortStatus}
          defaultColumnProps={{
            sortable: true,
          }}
          columns={columns.map((column) => ({
            ...column,
            sortable: column.accessor !== "actions",
          }))}
        />
      </Stack>
    </Container>
  );
}
