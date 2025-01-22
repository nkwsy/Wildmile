import { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Text,
  Button,
  Group,
  Stack,
  Paper,
  Breadcrumbs,
  Anchor,
  Checkbox,
  LoadingOverlay,
  Pagination,
  Image,
  Modal,
  List,
  Alert,
  Badge,
  Title,
  Collapse,
} from "@mantine/core";
import {
  IconFolder,
  IconPhoto,
  IconCheck,
  IconExclamationCircle,
  IconTrash,
  IconPlus,
} from "@tabler/icons-react";
import { useDisclosure } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import Link from "next/link";
export function DeploymentImageAssigner({ deploymentId }) {
  const [loading, setLoading] = useState(false);
  const [currentPath, setCurrentPath] = useState("");
  const [currentPathDepth, setCurrentPathDepth] = useState(0);
  const [folders, setFolders] = useState([]);
  const [images, setImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [showAll, setShowAll] = useState(false);
  const [totalImages, setTotalImages] = useState(0);
  const [timestamps, setTimestamps] = useState(null);
  const [page, setPage] = useState(1);
  const IMAGES_PER_PAGE = 16;
  const [confirmationData, setConfirmationData] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deployment, setDeployment] = useState(null);
  const [opened, { toggle }] = useDisclosure(false);
  // Fetch folders and images for current path
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/cameratrap/getMediaByPath?path=${currentPath}&limit=${
            showAll ? 0 : IMAGES_PER_PAGE
          }&page=${page}`
        );
        const data = await response.json();

        setFolders(data.folders || []);
        setImages(data.images || []);
        setTotalImages(data.totalImages || 0);
        setCurrentPathDepth(currentPath.split("/").length || 0);
        setTimestamps(data.timestamps || null);
      } catch (error) {
        console.error("Error fetching media:", error);
        notifications.show({
          title: "Error",
          message: "Failed to fetch media",
          color: "red",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPath, showAll, page]);

  useEffect(() => {
    const fetchDeployment = async () => {
      const response = await fetch(
        `/api/cameratrap/deployments/${deploymentId}`
      );
      const data = await response.json();
      setDeployment(data);
    };
    fetchDeployment();
  }, [deploymentId]);

  // Handle folder navigation
  const handleFolderClick = (folderName) => {
    setCurrentPath(currentPath ? `${currentPath}/${folderName}` : folderName);
    setPage(1);
    setSelectedImages([]);
  };

  // Handle breadcrumb navigation
  const handleBreadcrumbClick = (index) => {
    const newPath = currentPath.split("/").slice(0, index).join("/");
    setCurrentPath(newPath);
    setPage(1);
    setSelectedImages([]);
  };

  // Handle image selection
  const handleImageSelect = (imageId) => {
    setSelectedImages((prev) =>
      prev.includes(imageId)
        ? prev.filter((id) => id !== imageId)
        : [...prev, imageId]
    );
  };

  // Handle select all
  const handleSelectAll = () => {
    setSelectedImages((prev) =>
      prev.length === images.length ? [] : images.map((img) => img._id)
    );
  };

  const checkAndConfirmAssignment = async (isFolder = false, imageIds = []) => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/cameratrap/checkImagesBeforeAssignment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            deploymentId,
            currentPath: isFolder ? currentPath : undefined,
            imageIds: !isFolder ? imageIds : undefined,
          }),
        }
      );

      if (!response.ok) throw new Error("Failed to check images");

      const data = await response.json();
      setConfirmationData({
        totalCount: data.totalCount,
        conflictingImages: data.conflictingImages,
        isFolder,
        imageIds,
      });
      setShowConfirmModal(true);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to check images",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAssignment = async () => {
    setShowConfirmModal(false);
    setLoading(true);

    try {
      const response = await fetch("/api/cameratrap/assignImagesToDeployment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deploymentId,
          currentPath: confirmationData.isFolder ? currentPath : undefined,
          imageIds: !confirmationData.isFolder
            ? confirmationData.imageIds
            : undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign images");

      const data = await response.json();
      notifications.show({
        title: "Success",
        message: data.message,
        color: "green",
      });

      setSelectedImages([]);
      setPage(1);
    } catch (error) {
      notifications.show({
        title: "Error",
        message: "Failed to assign images",
        color: "red",
      });
    } finally {
      setLoading(false);
      setConfirmationData(null);
    }
  };

  // Add new function to handle assigning all images in current folder
  const handleAssignAllInFolder = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cameratrap/assignImagesToDeployment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deploymentId,
          currentPath,
        }),
      });

      if (!response.ok) throw new Error("Failed to assign images");

      const data = await response.json();
      notifications.show({
        title: "Success",
        message: data.message,
        color: "green",
      });

      // Refresh images
      setSelectedImages([]);
      setPage(1);
    } catch (error) {
      console.error("Error assigning all images:", error);
      notifications.show({
        title: "Error",
        message: "Failed to assign images to deployment",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  // Add new function to handle removing images
  const handleRemoveImages = async (imageIds) => {
    setLoading(true);
    try {
      const response = await fetch(
        "/api/cameratrap/removeImagesFromDeployment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageIds }),
        }
      );

      if (!response.ok) throw new Error("Failed to remove images");

      const data = await response.json();
      notifications.show({
        title: "Success",
        message: data.message,
        color: "green",
      });

      // Refresh images
      setSelectedImages([]);
      setPage(1);
    } catch (error) {
      console.error("Error removing images:", error);
      notifications.show({
        title: "Error",
        message: "Failed to remove images from deployment",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Paper p="md" radius="md" withBorder>
        <LoadingOverlay visible={loading} />
        <Group position="apart">
          <Title order={4}>Add New Images to Deployment</Title>
          <Text size="sm" color="dimmed">
            Select images from the folder structure below to add to this
            deployment. Pay attention to the images that are already assigned to
            this deployment.
          </Text>
          <Button
            variant="default"
            leftSection={<IconPlus size={16} />}
            onClick={toggle}
          >
            Add Images
          </Button>
        </Group>
        <Collapse in={opened}>
          <Stack spacing="md">
            {/* Breadcrumbs */}
            <Breadcrumbs>
              <Anchor onClick={() => handleBreadcrumbClick(-1)}>Root</Anchor>
              {currentPath.split("/").map((folder, index) => (
                <Anchor
                  key={index}
                  onClick={() => handleBreadcrumbClick(index + 1)}
                >
                  {folder}
                </Anchor>
              ))}
            </Breadcrumbs>
            <Group>
              <Badge size="md" align="flex-end">
                {totalImages.toLocaleString()} images
              </Badge>
              {timestamps && (
                <Text size="sm" color="dimmed">
                  Time Range: {new Date(timestamps.earliest).toLocaleString()} -{" "}
                  {new Date(timestamps.latest).toLocaleString()}
                </Text>
              )}
            </Group>

            {/* Controls */}
            <Group position="apart">
              <Button.Group>
                <Button
                  onClick={handleSelectAll}
                  variant="default"
                  leftSection={<IconCheck size={16} />}
                >
                  {selectedImages.length === images.length
                    ? "Deselect All"
                    : "Select All"}
                </Button>
                <Button onClick={() => setShowAll(!showAll)} variant="default">
                  {showAll ? "Show Sample" : "Show All"}
                </Button>
                {currentPathDepth > 1 && (
                  <Button
                    onClick={() => checkAndConfirmAssignment(true)}
                    variant="filled"
                    color="blue"
                    leftSection={<IconFolder size={16} />}
                  >
                    Assign All in Folder
                  </Button>
                )}
              </Button.Group>

              <Group>
                {selectedImages.length > 0 && (
                  <Button
                    onClick={() => handleRemoveImages(selectedImages)}
                    color="red"
                    variant="light"
                    leftSection={<IconTrash size={16} />}
                  >
                    Remove {selectedImages.length} Selected
                  </Button>
                )}
                <Button
                  onClick={() =>
                    checkAndConfirmAssignment(false, selectedImages)
                  }
                  disabled={selectedImages.length === 0}
                >
                  Assign {selectedImages.length} Selected
                </Button>
              </Group>
            </Group>

            {/* Folders Grid */}
            {folders.length > 0 && (
              <Paper withBorder p="md">
                <Text weight={500} mb="sm">
                  Folders
                </Text>
                <Grid>
                  {folders.map((folder) => (
                    <Grid.Col key={folder} span={3}>
                      <Paper
                        p="xs"
                        withBorder
                        sx={{ cursor: "pointer" }}
                        onClick={() => handleFolderClick(folder)}
                      >
                        <Group>
                          <IconFolder size={24} />
                          <Text size="sm" truncate>
                            {folder}
                          </Text>
                        </Group>
                      </Paper>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Images Grid */}
            {images.length > 0 && (
              <Paper withBorder p="md">
                <Text weight={500} mb="sm">
                  Images
                </Text>
                <Grid>
                  {images.map((image) => (
                    <Grid.Col key={image._id} span={3}>
                      <Paper
                        p="xs"
                        withBorder
                        sx={{
                          cursor: "pointer",
                          border: selectedImages.includes(image._id)
                            ? "2px solid blue"
                            : undefined,
                        }}
                        onClick={() => handleImageSelect(image._id)}
                      >
                        <Stack spacing="xs">
                          <Image
                            src={image.publicURL}
                            alt={
                              Array.isArray(image.relativePath)
                                ? image.relativePath[
                                    image.relativePath.length - 1
                                  ]
                                : "Image"
                            }
                            radius="sm"
                            fit="contain"
                            height={150}
                            withPlaceholder
                          />
                          <Group position="apart">
                            <Text size="xs">
                              {Array.isArray(image.relativePath)
                                ? image.relativePath[
                                    image.relativePath.length - 1
                                  ]
                                : "Unnamed Image"}
                            </Text>
                            <Checkbox
                              checked={selectedImages.includes(image._id)}
                              onChange={() => handleImageSelect(image._id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            {image.deploymentId &&
                              image.deploymentId !== deploymentId && (
                                <Badge
                                  size="sm"
                                  variant="filled"
                                  color="yellow"
                                  component={Link}
                                  href={`/cameratrap/deployment/edit/${image.deploymentId}`}
                                >
                                  <IconExclamationCircle size={16} />
                                  {/* {image.deploymentId.locationName} */}
                                </Badge>
                              )}
                            {image.deploymentId === deploymentId && (
                              <Badge size="sm" variant="filled" color="green">
                                <IconCheck size={16} />
                              </Badge>
                            )}
                            <Text size="xs" color="dimmed">
                              {new Date(image.timestamp).toLocaleString()}
                            </Text>
                          </Group>
                        </Stack>
                      </Paper>
                    </Grid.Col>
                  ))}
                </Grid>
              </Paper>
            )}

            {/* Pagination */}
            {!showAll && totalImages > IMAGES_PER_PAGE && (
              <Pagination
                total={Math.ceil(totalImages / IMAGES_PER_PAGE)}
                value={page}
                onChange={setPage}
                position="center"
              />
            )}
          </Stack>
        </Collapse>
      </Paper>

      <Modal
        opened={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmationData(null);
        }}
        title="Confirm Assignment"
        size="lg"
      >
        <Stack spacing="md">
          <Text>
            You are about to assign {confirmationData?.totalCount} images to
            this deployment.
          </Text>

          {confirmationData?.conflictingImages?.length > 0 && (
            <Alert
              icon={<IconExclamationCircle size={16} />}
              color="yellow"
              title="Warning"
            >
              <Text mb="sm">
                The following images are already assigned to other deployments
                and will be reassigned:
              </Text>
              <List size="sm" spacing="xs">
                {confirmationData.conflictingImages.map((img, index) => (
                  <List.Item key={index}>
                    {Array.isArray(img.relativePath)
                      ? img.relativePath.join("/")
                      : img.relativePath}{" "}
                    (Currently assigned to: {img.deploymentId})
                  </List.Item>
                ))}
              </List>
            </Alert>
          )}

          <Group position="right">
            <Button
              variant="default"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button color="blue" onClick={handleConfirmAssignment}>
              Continue
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
