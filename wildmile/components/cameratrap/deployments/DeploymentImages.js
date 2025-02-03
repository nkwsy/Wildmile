import { useState, useEffect } from "react";
import {
  Paper,
  Text,
  Grid,
  Image,
  Group,
  Button,
  Stack,
  Pagination,
  LoadingOverlay,
  Badge,
  Menu,
  ActionIcon,
  SegmentedControl,
} from "@mantine/core";
import {
  DatePicker,
  TimeInput,
  DatePickerInput,
  TimeInputInput,
} from "@mantine/dates";
import {
  IconPhoto,
  IconEye,
  IconHeart,
  IconFilter,
  IconUser,
  IconPaw,
  IconClock,
  IconCalendar,
  IconX,
} from "@tabler/icons-react";
import { SpeciesConsensusBadges } from "../SpeciesConsensusBadges";
import { ImageGallery } from "../images/ImageGallery";

export function DeploymentImages({ deploymentId }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalImages, setTotalImages] = useState(0);
  const IMAGES_PER_PAGE = 12;
  const [filters, setFilters] = useState({
    type: "all", // 'all', 'animals', 'humans'
    date: null,
    time: null,
  });

  const fetchImages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page,
        deploymentId: deploymentId,
        limit: IMAGES_PER_PAGE,
        type: filters.type,
        ...(filters.date && { date: filters.date.toISOString() }),
        ...(filters.time && { time: filters.time }),
      });

      const response = await fetch(
        `/api/cameratrap/getCameratrapImages?${params}`,
        { next: { tags: ["deployments"] } }
      );
      if (!response.ok) throw new Error("Failed to fetch images");
      const data = await response.json();
      setImages(data.images);
      setTotalImages(data.totalImages);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching deployment images:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (deploymentId) {
      fetchImages();
    }
  }, [deploymentId, page, filters]);

  useEffect(() => {
    setPage(1);
  }, [filters]);

  const clearFilters = () => {
    setFilters({
      type: "all",
      date: null,
      time: null,
    });
  };

  if (error) {
    return (
      <Paper p="md" withBorder>
        <Text color="red">{error}</Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" radius="md" withBorder>
      <LoadingOverlay visible={loading} />

      <Stack spacing="md">
        <Group position="apart">
          <Group>
            <IconPhoto size={24} />
            <Text size="lg" weight={500}>
              Deployment Images
            </Text>
            <Badge size="lg">{totalImages} images</Badge>
          </Group>

          <Group>
            {(filters.type !== "all" || filters.date || filters.time) && (
              <Button
                variant="light"
                color="red"
                size="xs"
                leftSection={<IconX size={14} />}
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}

            <Menu position="bottom-end" withinPortal>
              <Menu.Target>
                <ActionIcon
                  variant="light"
                  color={
                    Object.values(filters).some((v) => v) ? "blue" : "gray"
                  }
                >
                  <IconFilter size={20} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Filter Images</Menu.Label>

                <Menu.Item>
                  <Stack spacing="xs">
                    <Text size="sm" weight={500}>
                      Type
                    </Text>
                    <SegmentedControl
                      value={filters.type}
                      onChange={(value) =>
                        setFilters((f) => ({ ...f, type: value }))
                      }
                      data={[
                        { label: "All", value: "all" },
                        {
                          label: (
                            <Group spacing={4}>
                              <IconPaw size={14} />
                              <span>Animals</span>
                            </Group>
                          ),
                          value: "animals",
                        },
                        {
                          label: (
                            <Group spacing={4}>
                              <IconUser size={14} />
                              <span>Humans</span>
                            </Group>
                          ),
                          value: "humans",
                        },
                      ]}
                    />
                  </Stack>
                </Menu.Item>

                <Menu.Item>
                  <Stack spacing="xs">
                    <Text size="sm" weight={500}>
                      Date
                    </Text>
                    <DatePicker
                      value={filters.date}
                      onChange={(date) => setFilters((f) => ({ ...f, date }))}
                      clearable
                      placeholder="Pick date"
                    />
                  </Stack>
                </Menu.Item>

                <Menu.Item>
                  <Stack spacing="xs">
                    <Text size="sm" weight={500}>
                      Time
                    </Text>
                    <TimeInput
                      value={filters.time}
                      onChange={(event) =>
                        setFilters((f) => ({
                          ...f,
                          time: event.currentTarget.value,
                        }))
                      }
                      clearable
                      placeholder="Pick time"
                    />
                  </Stack>
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
        {images.length === 0 && !loading ? (
          <Text color="dimmed" align="center" py="xl">
            No images found for this deployment
          </Text>
        ) : (
          <ImageGallery
            images={images}
            totalImages={totalImages}
            page={page}
            setPage={setPage}
            onPageChange={setPage}
            loading={loading}
          />
        )}
      </Stack>
    </Paper>
  );
}
