import React, { useState, useEffect } from "react";
import {
  Stack,
  Text,
  Group,
  Avatar,
  Badge,
  Popover,
  Button,
  Card,
  Paper,
} from "@mantine/core";
import { IconPaw, IconUser, IconCar } from "@tabler/icons-react";
import { UserAvatar } from "/components/shared/UserAvatar";
const getObservationIcon = (type) => {
  switch (type) {
    case "animal":
      return <IconPaw size={16} />;
    case "human":
      return <IconUser size={16} />;
    case "vehicle":
      return <IconCar size={16} />;
    default:
      return null;
  }
};

const getObservationLabel = (observation) => {
  switch (observation.observationType) {
    case "animal":
      return `${observation.commonName || observation.scientificName} (${
        observation.count
      })`;
    case "human":
      return "Human Present";
    case "vehicle":
      return "Vehicle Present";
    case "blank":
      return "No Animals Visible";
    default:
      return observation.observationType;
  }
};

export function ObservationHistory({ previousObservations }) {
  if (!previousObservations || previousObservations.length === 0) {
    return (
      <Text size="sm" color="dimmed" align="center">
        No previous observations
      </Text>
    );
  }

  // Group observations by creator
  const observationsByCreator = previousObservations.reduce((acc, obs) => {
    const creatorName = obs.creator?.profile?.name || "unknown";
    if (!acc[creatorName]) {
      acc[creatorName] = {
        creator: obs.creator,
        observations: [],
      };
    }
    acc[creatorName].observations.push(obs);
    return acc;
  }, {});

  return (
    <>
      <Stack spacing="md">
        {Object.values(observationsByCreator).map((group, index) => (
          <Stack key={index} spacing="xs">
            {/* <Group spacing="xs"> */}
            <Group ml="xl" spacing="xs" wrap="wrap">
              <UserAvatar userId={group.creator._id} />
              {/* </Group> */}
              {group.observations.map((obs, obsIndex) => (
                <Badge
                  key={obsIndex}
                  size="sm"
                  variant="light"
                  leftSection={getObservationIcon(obs.observationType)}
                  color={obs.observationType === "animal" ? "green" : "blue"}
                >
                  {getObservationLabel(obs)}
                </Badge>
              ))}
            </Group>
            <Text size="xs" color="dimmed" ml="xl">
              {new Date(group.observations[0].createdAt).toLocaleDateString()}
            </Text>
          </Stack>
        ))}
      </Stack>
    </>
  );
}

export function ObservationHistoryPopover({ mediaID }) {
  const [previousObservations, setPreviousObservations] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const fetchObservations = async () => {
      if (mediaID) {
        // Fetch previous observations
        const response = await fetch(
          `/api/cameratrap/getObservations?mediaId=${mediaID}`
        );
        const data = await response.json();
        setPreviousObservations(data);
      }
      setLoading(false);
    };
    fetchObservations();
  }, [mediaID]);

  if (previousObservations.length === 0 || loading) {
    return <></>;
  }

  return (
    <>
      <Popover>
        <Popover.Target>
          <Button variant="outline" size="xs">
            View Observation History
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <ObservationHistory previousObservations={previousObservations} />
        </Popover.Dropdown>
      </Popover>
    </>
  );
}
