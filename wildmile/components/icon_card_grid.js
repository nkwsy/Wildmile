import { Stack, Group, SimpleGrid, Text, Title, Card } from "@mantine/core";
import Link from "next/link";
import classes from "/styles/card.module.css";

export function IconCardGrid(props) {
  const { cards, columns } = props;

  const content = cards.map((card) => {
    return (
      <Card
        key={card.title}
        withBorder
        shadow="md"
        radius="md"
        component="a"
        href={card.href}
      >
        <Group gap="xs">
          <card.icon size="2.5rem" stroke={2} />
          <Title size="h2" mt="md">
            {card.title}
          </Title>
        </Group>
        <Text fz="sm" c="dimmed" mt="sm">
          {card.description}
        </Text>
      </Card>
    );
  });

  return (
    <>
      <div className={classes.wrapper}>
        <SimpleGrid
          visibleFrom="md"
          spacing="xl"
          mt={40}
          cols={columns || 2}
          className="centerGrid"
        >
          {content}
        </SimpleGrid>
        <Stack hiddenFrom="md">{content}</Stack>
      </div>
    </>
  );
}
