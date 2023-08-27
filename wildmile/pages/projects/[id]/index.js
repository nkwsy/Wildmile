import { SimpleGrid, Title, Text, Container, Card, rem } from '@mantine/core'
import { IconListDetails } from '@tabler/icons-react'
import { useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../../../lib/hooks'
import { useRouter } from 'next/router'
import { cardStyles } from '../../../components/icon_card_grid'

export default function ProjectLanding() {
  const router = useRouter()
  const { classes, theme } = cardStyles()
  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

  return (
    <>
      <Container maw='75%' my={40}>
        <Title order={2} className={classes.title} ta="center" mt="sm">{router.query.id}</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <SimpleGrid mt={40} cols={2}>
          <Link href={"/projects/" + router.query.id + "/sections"}>
            <Card shadow="md" radius="md" className={classes.card} padding="xl">
              <IconListDetails size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                Sections
              </Text>
              <Text fz="sm" c="dimmed" mt="sm">
                View and Edit sections for this project
              </Text>
            </Card>
          </Link>
        </SimpleGrid>
      </Container>
    </>
  )
}

