import {SimpleGrid, Text, Card, rem } from '@mantine/core'
import Link from 'next/link'
import classes from '../styles/card.module.css'


export function IconCardGrid(props) {
  const { cards, columns } = props

  return (
    <>
      <SimpleGrid mt={40} cols={columns || 2}>
        {cards.map((card) => {
          return (
            <Link key={card.title} href={card.href}>
              <Card key={card.title} shadow="md" radius="md" className={classes.card} padding="xl">
                <card.icon size='2rem' stroke={2}/>
                <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                  {card.title}
                </Text>
                <Text fz="sm" c="dimmed" mt="sm">
                  {card.description}
                </Text>
              </Card>
            </Link>
          )
        })}
      </SimpleGrid>
    </>
  )
}

