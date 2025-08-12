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
} from "@mantine/core";
import { BarChart } from "@mantine/charts";

export default function MonthlyUserActivityPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2023 }, (_, i) =>
    (2024 + i).toString()
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/cameratrap/analytics/monthly-user-activity?year=${year}`
        );
        if (!res.ok) {
          throw new Error("Failed to fetch data");
        }
        const jsonData = await res.json();
        setData(jsonData);
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
      <Title order={2}>Volunteer Activity</Title>
      <Text size="sm" c="dimmed" fs="italic">
        Data current as of {today}
      </Text>
      <Select
        label="Select Year"
        value={year}
        onChange={setYear}
        data={years}
        style={{ marginTop: "1rem", marginBottom: "1rem" }}
      />
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
        <BarChart
          h={300}
          data={data}
          dataKey="month"
          series={[
            { name: "Active Volunteers", color: "blue.6" },
            { name: "New Volunteers", color: "green.6" },
          ]}
          yAxisLabel="Number of Volunteers"
          withLegend
        />
      )}
    </Paper>
  );
}
