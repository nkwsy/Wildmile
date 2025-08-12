"use client";
import { useState, useEffect } from "react";
import {
  Title,
  Paper,
  Loader,
  Center,
  Text,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";

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

  const today = new Date().toISOString().split("T")[0];

  const valueFormatter = (value) => {
    if (value === 0 ) {
      return ""
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  };

  return (
    <Paper shadow="md" p="md">
      <Title order={2}>Cumulative Images Over Time</Title>
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
          <BarChart
            h={300}
            data={data}
            dataKey="month"
            valueFormatter={valueFormatter}
            valueLabelProps={{ angle: -90, dy: -15, dx: 0, fill: 'black' }}
            withBarValueLabel
            series={[
              { name: "Images with Observations", color: "violet.6" },
              { name: "Total Images", color: "orange.6" },
            ]}
            yAxisLabel="Cumulative Count"
            xAxisLabel="Months"
            legendProps={{ verticalAlign: 'top', align: 'right' }}
            withLegend
          />
      )}
    </Paper>
  );
}
