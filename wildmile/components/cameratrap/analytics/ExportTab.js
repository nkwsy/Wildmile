"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  Text,
  Group,
  Stack,
  Loader,
  Center,
  Button,
  Badge,
  Table,
  Pagination,
  ScrollArea,
  Paper,
  Alert,
} from "@mantine/core";
import {
  IconDownload,
  IconFileTypeCsv,
  IconFileTypeJs,
  IconInfoCircle,
} from "@tabler/icons-react";

function buildParams(filters) {
  const params = new URLSearchParams();
  if (filters.startDate)
    params.set("startDate", filters.startDate.toISOString());
  if (filters.endDate) params.set("endDate", filters.endDate.toISOString());
  if (filters.species?.length)
    params.set("species", filters.species.join(","));
  if (filters.deploymentId) params.set("deploymentId", filters.deploymentId);
  return params;
}

export default function ExportTab({ filters }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [downloading, setDownloading] = useState(false);
  const limit = 50;

  useEffect(() => {
    setPage(1);
  }, [filters]);

  useEffect(() => {
    async function fetchPreview() {
      setLoading(true);
      try {
        const params = buildParams(filters);
        params.set("page", String(page));
        params.set("limit", String(limit));

        const res = await fetch(
          `/api/cameratrap/analytics/wildlife/export?${params}`
        );
        if (res.ok) setData(await res.json());
      } catch (err) {
        console.error("Export preview fetch error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPreview();
  }, [filters, page]);

  const downloadCSV = useCallback(async () => {
    setDownloading(true);
    try {
      const params = buildParams(filters);
      params.set("format", "csv");
      params.set("limit", "5000");
      params.set("page", "1");

      const res = await fetch(
        `/api/cameratrap/analytics/wildlife/export?${params}`
      );
      if (!res.ok) throw new Error("Download failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wildlife_observations_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("CSV download error:", err);
    } finally {
      setDownloading(false);
    }
  }, [filters]);

  const downloadJSON = useCallback(async () => {
    setDownloading(true);
    try {
      const params = buildParams(filters);
      params.set("limit", "5000");
      params.set("page", "1");

      const res = await fetch(
        `/api/cameratrap/analytics/wildlife/export?${params}`
      );
      if (!res.ok) throw new Error("Download failed");

      const json = await res.json();
      const blob = new Blob([JSON.stringify(json.data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `wildlife_observations_${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("JSON download error:", err);
    } finally {
      setDownloading(false);
    }
  }, [filters]);

  const columns = [
    "scientificName",
    "commonName",
    "count",
    "eventStart",
    "eventEnd",
    "locationName",
    "lifeStage",
    "sex",
    "behavior",
    "classificationMethod",
  ];

  const formatCell = (val, col) => {
    if (val === null || val === undefined) return "-";
    if (col === "eventStart" || col === "eventEnd") {
      return new Date(val).toLocaleString();
    }
    return String(val);
  };

  return (
    <Stack gap="md">
      <Card withBorder padding="lg" radius="md">
        <Group justify="space-between" mb="md">
          <Stack gap={2}>
            <Text fw={500} size="lg">
              Export Observation Data
            </Text>
            {data?.pagination && (
              <Text size="sm" c="dimmed">
                {data.pagination.total.toLocaleString()} total records matching
                current filters
              </Text>
            )}
          </Stack>
          <Group gap="sm">
            <Button
              leftSection={<IconFileTypeCsv size={18} />}
              onClick={downloadCSV}
              loading={downloading}
              variant="filled"
              color="green"
            >
              Download CSV
            </Button>
            <Button
              leftSection={<IconFileTypeJs size={18} />}
              onClick={downloadJSON}
              loading={downloading}
              variant="filled"
              color="blue"
            >
              Download JSON
            </Button>
          </Group>
        </Group>

        <Alert
          icon={<IconInfoCircle size={16} />}
          color="blue"
          variant="light"
          mb="md"
        >
          Downloads include up to 5,000 records per file. Use filters to narrow
          results. Data includes species name, count, timestamps, location,
          demographics, and classification info.
        </Alert>

        {filters.species?.length > 0 ||
        filters.startDate ||
        filters.endDate ||
        filters.deploymentId ? (
          <Group gap="xs" mb="md">
            <Text size="sm" fw={500}>
              Active filters:
            </Text>
            {filters.species?.map((s) => (
              <Badge key={s} variant="light" color="green" size="sm">
                {s}
              </Badge>
            ))}
            {filters.startDate && (
              <Badge variant="light" color="blue" size="sm">
                From: {filters.startDate.toLocaleDateString()}
              </Badge>
            )}
            {filters.endDate && (
              <Badge variant="light" color="blue" size="sm">
                To: {filters.endDate.toLocaleDateString()}
              </Badge>
            )}
            {filters.deploymentId && (
              <Badge variant="light" color="orange" size="sm">
                Location filtered
              </Badge>
            )}
          </Group>
        ) : null}
      </Card>

      <Card withBorder padding="lg" radius="md">
        <Text fw={500} size="lg" mb="md">
          Data Preview
        </Text>
        {loading ? (
          <Center py="xl">
            <Loader />
          </Center>
        ) : data?.data?.length > 0 ? (
          <>
            <ScrollArea w="100%" type="auto" scrollbars="x">
              <Table striped highlightOnHover withTableBorder withColumnBorders>
                <Table.Thead>
                  <Table.Tr>
                    {columns.map((col) => (
                      <Table.Th key={col}>
                        <Text size="xs" fw={600} tt="capitalize">
                          {col.replace(/([A-Z])/g, " $1").trim()}
                        </Text>
                      </Table.Th>
                    ))}
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {data.data.map((row, i) => (
                    <Table.Tr key={i}>
                      {columns.map((col) => (
                        <Table.Td key={col}>
                          <Text size="xs">{formatCell(row[col], col)}</Text>
                        </Table.Td>
                      ))}
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </ScrollArea>
            {data.pagination?.totalPages > 1 && (
              <Group justify="center" mt="md">
                <Pagination
                  total={data.pagination.totalPages}
                  value={page}
                  onChange={setPage}
                />
              </Group>
            )}
          </>
        ) : (
          <Center py="xl">
            <Text c="dimmed">No data matching current filters</Text>
          </Center>
        )}
      </Card>
    </Stack>
  );
}
