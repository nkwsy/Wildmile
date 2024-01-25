import { Stack, Group, SimpleGrid, Text, Title, Card } from '@mantine/core'
import Link from 'next/link'
import classes from '/styles/card.module.css'

export function IconCardGrid(props) {
  const { cards, columns } = props

  const content = cards.map((card) => {
    return (
      <Link key={card.title} href={card.href} className={classes.cardLink}>
        <Card key={card.title} withBorder shadow="md" radius="md" className={{ root: classes.card }} >
          <Group gap='xs'>
            <card.icon size='2.5rem' stroke={2} />
            <Title size="h2" className={classes.cardTitle} mt="md">
              {card.title}
            </Title>
          </Group>
          <Text fz="sm" c="dimmed" mt="sm">
            {card.description}
          </Text>
        </Card>
      </Link>
    )
  })

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
        <Stack hiddenFrom="md">
          {content}
        </Stack>
      </div>
    </>
  )
}