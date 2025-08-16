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
import AnalyticsStats from "components/analytics/AnalyticsStats";

export default function ObservationActivityPage() {
  const [year, setYear] = useState(new Date().getFullYear().toString());
  const [data, setData] = useState(null);
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
        const res = await fetch(`/api/cameratrap/analytics/observation-activity?year=${year}`);
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

  // Get today's date in Central Time (America/Chicago) in YYYY-MM-DD format
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  
  return (
    <>
      <AnalyticsStats page="observation-activity" />
      <Paper shadow="md" p="md">
        <Title order={2}>Image Observation Activity</Title>
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
          <ScrollArea w="100%" type="auto" scrollbars="x">
            <BarChart
              h={400}
              data={data}
              dataKey="month"
              series={[
                { name: "Observations", label: "Total Observations", color: "blue.6" },
                { name: "Images with observations", label: "Images observed", color: "orange.6" },
              ]}
              tickLine="y"
              yAxisLabel="Count"
              xAxisLabel="Months"
              withLegend
              withBarValueLabel
              valueFormatter={(value) => (value === 0 ? "" : value)}
              style={{ width: year === 'All' ? `${data.length * 100}px` : '100%' }}
            />
          </ScrollArea>
        )}
      </Paper>
    </>
  );
}
