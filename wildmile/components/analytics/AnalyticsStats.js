"use client";
import { useState, useEffect } from "react";
import { Grid, Paper, Text, Title } from "@mantine/core";

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

export default function AnalyticsStats({ page = "overview" }) {
  const [stats, setStats] = useState({
    totalImages: 0,
    totalObservations: 0,
    totalImagesWithObservations: 0,
    totalValidatedImages: 0,
    totalVolunteers: 0,
    avgObservationTimeSeconds: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/cameratrap/getStats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch stats", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading stats...</div>;
  }

  // Define which tiles to show for each page
  const getTilesForPage = (page) => {
    switch (page) {
      case "total-images":
        return [
          { title: "Total Images", value: stats.totalImages },
          { title: "Images with Observations", value: `${stats.totalImagesWithObservations} (${((stats.totalImagesWithObservations / stats.totalImages) * 100).toFixed(1)}%)` },
          { title: "Validated Images", value: `${stats.totalValidatedImages} (${((stats.totalValidatedImages / stats.totalImages) * 100).toFixed(1)}%)` },
        ];
      
      case "observation-activity":
        return [
          { title: "Total Observations", value: stats.totalObservations },
          { title: "Images with Observations", value: `${stats.totalImagesWithObservations} (${((stats.totalImagesWithObservations / stats.totalImages) * 100).toFixed(1)}%)` },
          { title: "Total Images", value: stats.totalImages },
        ];
      
      case "volunteer-activity":
        return [
          { title: "Total Volunteers", value: stats.totalVolunteers },
          { title: "Total Observations", value: stats.totalObservations },
          { title: "Total Volunteer Hours", value: `${(stats.totalObservations * stats.avgObservationTimeSeconds /60 /60).toFixed(0)}` },
        ];
      
      case "overview":
      default:
        return [
          { title: "Total Images", value: stats.totalImages },
          { title: "Images with Observations", value: `${stats.totalImagesWithObservations} (${((stats.totalImagesWithObservations / stats.totalImages) * 100).toFixed(1)}%)` },
          { title: "Validated Images", value: `${stats.totalValidatedImages} (${((stats.totalValidatedImages / stats.totalImages) * 100).toFixed(1)}%)` },
          { title: "Total Volunteers", value: stats.totalVolunteers },
        ];
    }
  };

  const tiles = getTilesForPage(page);
  const spanSize = tiles.length === 3 ? 3 : 4; // Adjust grid span based on tile count

  return (
    <Grid>
      {tiles.map((tile, index) => (
        <Grid.Col key={index} span={spanSize}>
          <StatTile title={tile.title} value={tile.value} />
        </Grid.Col>
      ))}
    </Grid>
  );
}
