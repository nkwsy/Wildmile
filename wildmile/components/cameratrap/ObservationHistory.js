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

  // TODO: get UserAvatar to be a server component
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

/**
 * "View Observation History" button + popover.
 *
 * When the parent already knows whether observations exist (the identify page
 * passes `hasObservations` from the media document), the history is fetched
 * lazily the first time the popover is opened — saving a ~400 ms
 * `getObservations` round trip on every image change. When `hasObservations`
 * is not supplied (e.g. the gallery), it falls back to the original behaviour:
 * fetch on mount and only render the button if there is history to show.
 */
async function fetchObservationHistory(mediaID) {
  try {
    const response = await fetch(
      `/api/cameratrap/getObservations?mediaId=${encodeURIComponent(mediaID)}`
    );
    const data = response.ok ? await response.json() : [];
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error("Error fetching observation history:", error);
    return [];
  }
}

export function ObservationHistoryPopover({ mediaID, hasObservations }) {
  // null = not loaded yet for this mediaID
  const [previousObservations, setPreviousObservations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [opened, setOpened] = useState(false);
  const knowsHasObservations = typeof hasObservations === "boolean";
  // The image a response must belong to in order to be applied. Guards against
  // a request started for image A resolving after image B is already shown.
  const activeMediaIdRef = React.useRef(mediaID);

  // Reset whenever the image changes so stale history is never shown. In
  // legacy mode (no hint from the parent) also fetch eagerly, as before, so we
  // can decide whether to render the button at all.
  useEffect(() => {
    activeMediaIdRef.current = mediaID;
    setPreviousObservations(null);
    setOpened(false);
    setLoading(false);
    if (knowsHasObservations || !mediaID) return undefined;

    let cancelled = false;
    setLoading(true);
    fetchObservationHistory(mediaID).then((data) => {
      if (cancelled) return;
      setPreviousObservations(data);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [mediaID, knowsHasObservations]);

  // Lazy mode: fetch the first time the popover is opened. A response is only
  // applied if the image it was requested for is still the one being shown.
  const loadHistory = async () => {
    if (!mediaID || previousObservations !== null || loading) return;
    const requestedFor = mediaID;
    setLoading(true);
    const data = await fetchObservationHistory(requestedFor);
    if (activeMediaIdRef.current !== requestedFor) return;
    setPreviousObservations(data);
    setLoading(false);
  };

  if (!mediaID) {
    return <></>;
  }
  if (knowsHasObservations && !hasObservations) {
    return <></>;
  }
  if (
    !knowsHasObservations &&
    (previousObservations === null || previousObservations.length === 0)
  ) {
    return <></>;
  }

  return (
    <>
      <Popover opened={opened} onChange={setOpened}>
        <Popover.Target>
          <Button
            variant="outline"
            size="xs"
            loading={loading}
            onClick={() => {
              setOpened((o) => !o);
              loadHistory();
            }}
          >
            View Observation History
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          {previousObservations === null ? (
            <Text size="sm" c="dimmed">
              Loading…
            </Text>
          ) : (
            <ObservationHistory previousObservations={previousObservations} />
          )}
        </Popover.Dropdown>
      </Popover>
    </>
  );
}
