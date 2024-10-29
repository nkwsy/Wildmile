"use client";

import React, { useState, useEffect } from 'react';
import { Paper, Title, Text, Group, Stack, Loader, Button, Tooltip } from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';

export function InfoComponent() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/cameratrap/getStats');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('Failed to load statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
  };

  if (loading) {
    return (
      <Paper p="md" shadow="xs">
        <Group position="center">
          <Loader />
          <Text size="sm" color="dimmed">Loading statistics...</Text>
        </Group>
      </Paper>
    );
  }

  if (error || !stats) {
    return (
      <Paper p="md" shadow="xs">
        <Stack align="center" spacing="md">
          <Text color="red">{error || 'Unable to load statistics'}</Text>
          <Button 
            variant="light" 
            onClick={handleRefresh}
            leftIcon={<IconRefresh size={16} />}
          >
            Retry
          </Button>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Stack spacing="md">
        <Group position="apart">
          <Title order={3}>Camera Trap Statistics</Title>
          <Tooltip label="Refresh statistics">
            <Button 
              variant="subtle" 
              size="sm"
              onClick={handleRefresh}
              loading={loading}
              leftIcon={<IconRefresh size={16} />}
            >
              Refresh
            </Button>
          </Tooltip>
        </Group>
        
        <Group position="apart">
          <Stack spacing="xs">
            <Text size="sm" color="dimmed">Total Images</Text>
            <Text size="lg" weight={500}>{stats.totalImages.toLocaleString()}</Text>
          </Stack>
          <Stack spacing="xs">
            <Text size="sm" color="dimmed">Images with Observations</Text>
            <Text size="lg" weight={500}>{stats.uniqueMediaIds.toLocaleString()}</Text>
          </Stack>
          <Stack spacing="xs">
            <Text size="sm" color="dimmed">New Images (30 days)</Text>
            <Text size="lg" weight={500}>{stats.newImages30Days.toLocaleString()}</Text>
          </Stack>
        </Group>

        <Stack spacing="xs">
          <Text size="sm" weight={500}>Top 3 Observers</Text>
          {stats.topCreators.length > 0 ? (
            stats.topCreators.map((creator, index) => (
              <Group key={creator.id || index} position="apart">
                <Text size="sm">{creator.name || 'Unknown User'}</Text>
                <Text size="sm" color="dimmed">
                  {creator.count.toLocaleString()} observation{creator.count !== 1 ? 's' : ''}
                </Text>
              </Group>
            ))
          ) : (
            <Text size="sm" color="dimmed" italic>No observations recorded yet</Text>
          )}
        </Stack>

        <Stack spacing="xs">
          <Text size="sm" weight={500}>Recent Activity</Text>
          <Group position="apart">
            <Text size="sm">Most Active (7 days)</Text>
            <Text size="sm" color="dimmed">
              {stats.mostActive7Days?.name || 'No activity'} 
              {stats.mostActive7Days?.count ? 
                ` (${stats.mostActive7Days.count.toLocaleString()} observation${stats.mostActive7Days.count !== 1 ? 's' : ''})` 
                : ''}
            </Text>
          </Group>
        </Stack>

        <Stack spacing="xs">
          <Text size="sm" weight={500}>Blank Images</Text>
          <Group position="apart">
            <Text size="sm">Most Blanks Logged</Text>
            <Text size="sm" color="dimmed">
              {stats.mostBlanks?.name || 'No blanks'} 
              {stats.mostBlanks?.count ? 
                ` (${stats.mostBlanks.count.toLocaleString()})` 
                : ''}
            </Text>
          </Group>
        </Stack>
      </Stack>
    </Paper>
  );
}

export default InfoComponent;