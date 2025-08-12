"use client";
import { useState, useEffect } from "react";
import {
  Title,
  Select,
  Paper,
  Loader,
  Center,
  Text,
  ScrollArea,
  Group,
  Stack,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";

function StatTile({ title, value }) {
  return (
    <Paper withBorder p="md" radius="md">
      <Text size="xs" c="dimmed">
        {title}
      </Text>
      <Text size="lg" fw={500}>
        {value}
      </Text>
    </Paper>
  );
}

export default function CameraTrapAnalyticsPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState(null);
  const [totalVolunteers, setTotalVolunteers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 }, (_, i) =>
    (2024 + i).toString()
  );
  years.unshift("All");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/cameratrap/analytics?year=${year}`);
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await res.json();
        setData(jsonData.monthlyData);
        setTotalVolunteers(jsonData.totalVolunteers);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year]);

  const today = new Date().toISOString().split("T")[0];

  return (
    <Paper shadow="md" p="md">
      <Title order={2}>Community Observation Activity</Title>
      <Text size="sm" c="dimmed" fs="italic">
        Data current as of {today}
      </Text>
      <Group justify="space-between" align="flex-end" mt="md" mb="md">
        <Select
          label="Select Year"
          value={year}
          onChange={setYear}
          data={years}
        />
        <StatTile title="Total Volunteers" value={totalVolunteers} />
      </Group>

      {loading && (
        <Center>
          <Loader />
        </Center>
      )}
      {error && (
        <Center>
          <Text color="red">{error}</Text>
        </Center>
      )}
      {data && !loading && (
        <ScrollArea w="100%" type={year === "All" ? "auto" : "never"}>
          <BarChart
            h={500}
            data={data}
            dataKey="month"
            series={[{ name: "Observations", color: "blue.6" }]}
            tickLine="y"
            yAxisLabel="Number of Observations"
            xAxisLabel="Months"
            withBarValueLabel
            style={{ width: year === "All" ? `${data.length * 80}px` : "100%" }}
          />
        </ScrollArea>
      )}
    </Paper>
  );
}
