import { Group, Badge, Tooltip } from "@mantine/core";
import { IconUser, IconPaw } from "@tabler/icons-react";
import { useHover } from "@mantine/hooks";

export function SpeciesConsensusBadges({ speciesConsensus }) {
  if (!speciesConsensus || speciesConsensus.length === 0) {
    return null;
  }
  if (speciesConsensus.length > 1) {
    return null;
  }

  return (
    <Group justify="flex-start" gap="xs">
      {speciesConsensus.map((consensus) => {
        if (consensus.observationType === "human") {
          return (
            <Tooltip
              key={consensus._id}
              label={`Human (${consensus.observationCount} observations)`}
            >
              <Badge
                size="sm"
                color="gray"
                variant={consensus.accepted ? "filled" : "light"}
                circle
                center
              >
                <div style={{ display: "flex", alignItems: "center" }}>
                  <IconUser size={14} />
                </div>
              </Badge>
            </Tooltip>
          );
        }

        if (consensus.observationType === "animal") {
          return (
            <Tooltip
              key={consensus._id}
              label={speciesConsensus
                .filter((species) => species.observationType === "animal")
                .map(
                  (species) =>
                    `${species.scientificName} - Count: ${species.count} (${species.observationCount} observations)`
                )
                .join("\n")}
            >
              <Badge
                size="sm"
                variant={consensus.accepted ? "filled" : "light"}
                leftSection={<IconPaw size={14} />}
                color="green"
              >
                {
                  speciesConsensus.filter(
                    (species) => species.observationType === "animal"
                  ).length
                }{" "}
              </Badge>
            </Tooltip>
          );
        }

        return null;
      })}
    </Group>
  );
}
