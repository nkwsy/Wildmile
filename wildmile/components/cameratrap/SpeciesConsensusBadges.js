import { Group, Badge, Tooltip } from '@mantine/core';
import { IconUser, IconPaw } from '@tabler/icons-react';

export function SpeciesConsensusBadges({ speciesConsensus }) {
  if (!speciesConsensus || speciesConsensus.length === 0) {
    return null;
  }

  return (
    <Group spacing="xs">
      {speciesConsensus.map((consensus) => {
        if (consensus.observationType === 'human') {
          return (
            <Tooltip 
              key={consensus._id} 
              label={`Human (${consensus.observationCount} observations)`}
            >
              <Badge 
                size="sm" 
                variant={consensus.accepted ? "filled" : "light"}
                leftSection={<IconUser size={14} />}
              >
                {consensus.observationCount}
              </Badge>
            </Tooltip>
          );
        }
        
        if (consensus.observationType === 'animal') {
          return (
            <Tooltip 
              key={consensus._id} 
              label={`${consensus.scientificName} - Count: ${consensus.count} (${consensus.observationCount} observations)`}
            >
              <Badge 
                size="sm" 
                variant={consensus.accepted ? "filled" : "light"}
                leftSection={<IconPaw size={14} />}
              >
                {consensus.scientificName} ({consensus.count})
              </Badge>
            </Tooltip>
          );
        }
        
        return null;
      })}
    </Group>
  );
} 