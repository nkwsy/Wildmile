"use client";
import { useState, useEffect } from "react";
import {
  Title,
  Paper,
  Loader,
  Center,
  Text,
  ScrollArea,
} from "@mantine/core";
import { CompositeChart } from "@mantine/charts";

export default function TotalImagesPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/cameratrap/analytics/total-images?year=All`
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
  }, []);

  // Get today's date in Central Time (America/Chicago) in YYYY-MM-DD format
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Chicago",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  const valueFormatter = (value) => {
    return value.toLocaleString();
  };

  return (
    <Paper shadow="md" p="md">
      <Title order={2}>Total Images with Observations</Title>
      <Text size="sm" c="dimmed" fs="italic">
        Data current as of {today}
      </Text>
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
        <ScrollArea w="100%" type="horizontal">
          <CompositeChart
            h={400}
            data={data}
            dataKey="month"
            valueFormatter={valueFormatter}
            // withPointLabels
            series={[
              { name: "Total Images", color: "orange.6", type: "area" },
              { name: "Images with Observations", color: "green.6", type: "area" },
              { name: "Validated Images", color: "blue.6", type: "area" },
            ]}
            yAxisLabel="Cumulative Count"
            xAxisLabel="Months"
            legendProps={{ verticalAlign: 'top', align: 'right' }}
            withLegend
            xAxisProps={{
              tickFormatter: (value, index) => {
                // Show every other label (even indices: 0, 2, 4, etc.)
                return index % 2 === 0 ? value : '';
              }
            }}
            referenceLines={[
              { x: '1/2025', color: 'blue.2', strokeDasharray: '5 5'}
            ]}
          />
        </ScrollArea>
      )}
    </Paper>
  );
}
