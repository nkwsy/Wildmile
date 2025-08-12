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

export default function AnalyticsStats() {
  const [stats, setStats] = useState({
    totalImages: 0,
    totalImagesWithObservations: 0,
    totalValidatedImages: 0,
    totalVolunteers: 0,
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

  return (
    <Grid>
      <Grid.Col span={3}>
        <StatTile title="Total Images" value={stats.totalImages} />
      </Grid.Col>
      <Grid.Col span={3}>
        <StatTile
          title="Images with Observations"
          value={stats.totalImagesWithObservations}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <StatTile
          title="Images with Validated Observations"
          value={stats.totalValidatedImages}
        />
      </Grid.Col>
      <Grid.Col span={3}>
        <StatTile title="Total Volunteers" value={stats.totalVolunteers} />
      </Grid.Col>
    </Grid>
  );
}
