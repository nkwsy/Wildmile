import { updateUserStats } from "/app/actions/UserActions";
import {
  Paper,
  Title,
  Text,
  Group,
  Stack,
  Grid,
  Card,
  Badge,
  Avatar,
  SimpleGrid,
  Progress,
  Tooltip,
  Tabs,
} from "@mantine/core";
import {
  IconPaw,
  IconCamera,
  IconEye,
  IconMedal,
  IconTrophy,
  IconStars,
  IconCalendarStats,
} from "@tabler/icons-react";

export async function UserInfoServer({ user }) {
  if (!user) {
    return (
      <Paper p="md" shadow="xs">
        <Text color="dimmed" align="center">
          Please sign in to view your statistics
        </Text>
      </Paper>
    );
  }

  let stats;
  try {
    stats = user?._id ? await updateUserStats(user._id) : null;
  } catch (error) {
    console.error("Error loading user stats:", error);
  }

  if (!stats) {
    return (
      <Paper p="md" shadow="xs">
        <Text color="red" align="center">
          Unable to load user statistics
        </Text>
      </Paper>
    );
  }

  return (
    <Paper p="md" shadow="xs">
      <Stack spacing="lg">
        <Group position="apart" align="flex-start">
          <Group>
            <Stack spacing={0}>
              <Avatar size={80} src={stats.user.avatar} radius="xl">
                {stats.user.profile?.name?.charAt(0) || "?"}
              </Avatar>
              {stats.currentRank && (
                <Badge
                  variant="gradient"
                  gradient={{ from: "gold", to: "orange" }}
                  style={{ width: "fit-content", margin: "0 auto" }}
                >
                  {stats.currentRank}
                </Badge>
              )}
            </Stack>
            <div>
              <Title order={3}>
                {stats.user.profile?.name || "Anonymous User"}
              </Title>
              <Group spacing="xs">
                {stats.user.roles.map((role, index) => (
                  <Badge key={index} size="sm" variant="light">
                    {role}
                  </Badge>
                ))}
              </Group>
              {stats.totalPoints && (
                <Group spacing="xs" mt="xs">
                  <IconTrophy size={16} />
                  <Text size="sm" color="dimmed">
                    {stats.totalPoints.toLocaleString()} points
                  </Text>
                </Group>
              )}
            </div>
          </Group>
        </Group>

        {/* Recent Achievements */}
        {stats?.achievements?.length > 0 && (
          <Stack spacing={4}>
            <Text size="xs" weight={500}>
              Recent Achievements
            </Text>
            <Group spacing={4}>
              {stats.achievements
                .filter((a) => a.progress === 100)
                .slice(0, 5)
                .map((achievement) => (
                  <Tooltip
                    key={achievement.id}
                    label={`${achievement.name}: ${achievement.description}`}
                  >
                    <Avatar
                      size="sm"
                      src={achievement.icon || achievement.badge || "💩"}
                    >
                      {achievement.points}
                    </Avatar>
                  </Tooltip>
                ))}
            </Group>
          </Stack>
        )}

        {/* Domain Ranks */}
        {stats?.domainRanks && Object.entries(stats.domainRanks).length > 0 && (
          <Stack spacing={4}>
            <Text size="xs" weight={500}>
              Domain Ranks
            </Text>
            <Group spacing={4}>
              {Object.entries(stats.domainRanks).map(([domain, rank]) => (
                <Tooltip
                  key={domain}
                  label={`${domain}: ${rank.points} points`}
                >
                  <Badge size="sm" variant="light">
                    {domain}: {rank.points}
                  </Badge>
                </Tooltip>
              ))}
            </Group>
          </Stack>
        )}

        {/* Quick Stats */}
        <SimpleGrid cols={3} spacing="xs">
          <Paper withBorder p="xs" radius="md">
            <Group spacing={4}>
              <IconPaw size={16} />
              <Text size="xs">{stats?.stats?.animalsObserved || 0}</Text>
            </Group>
            <Text size="xs" color="dimmed">
              Animals Observed
            </Text>
          </Paper>
          <Paper withBorder p="xs" radius="md">
            <Group spacing={4}>
              <IconCamera size={16} />
              <Text size="xs">{stats?.stats?.imagesReviewed || 0}</Text>
            </Group>
            <Text size="xs" color="dimmed">
              Images Reviewed
            </Text>
          </Paper>
          <Paper withBorder p="xs" radius="md">
            <Group spacing={4}>
              <IconCalendarStats size={16} />
              <Text size="xs">{stats?.streaks?.current || 0}</Text>
            </Group>
            <Text size="xs" color="dimmed">
              Consecutive Days
            </Text>
          </Paper>
          <Paper withBorder p="xs" radius="md">
            <Group spacing={4}>
              <IconEye size={16} />
              <Text size="xs">{stats?.stats?.blanksLogged || 0}</Text>
            </Group>
            <Text size="xs" color="dimmed">
              Blank Images
            </Text>
          </Paper>
          <Paper withBorder p="xs" radius="md">
            <Group spacing={4}>
              <IconMedal size={16} />
              <Text size="xs">{stats?.stats?.uniqueSpecies || 0}</Text>
            </Group>
            <Text size="xs" color="dimmed" weight={500}>
              Species Found
            </Text>
          </Paper>
        </SimpleGrid>
      </Stack>
    </Paper>
  );
}
