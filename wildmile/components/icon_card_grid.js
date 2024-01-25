import { Stack, Group, SimpleGrid, Text, Card } from '@mantine/core'
import Link from 'next/link'
import classes from '/styles/card.module.css'

export function IconCardGrid(props) {
  const { cards, columns } = props

  const content = cards.map((card) => {
    return (
      <Link key={card.title} href={card.href}>
        <Card key={card.title} shadow="md" radius="md" className={classes.card} >
          <Group>
            <card.icon size='2rem' stroke={2} />
            <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
              {card.title}
            </Text>
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