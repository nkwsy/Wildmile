import { createStyles, SimpleGrid, Title, Text, Container, Card, rem } from '@mantine/core'
import { IconTrash, IconPlant2, IconListDetails, IconUsers } from '@tabler/icons-react'
import { useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../lib/hooks'
// import { cardStyles } from '../components/icon_card_grid'
import classes from '/styles/card.module.css'

export default function HomePage() {
  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

  return (
    <>
      <Container maw='75%' my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">Home Page</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <SimpleGrid cols={2}  mt={30} spacing={50}  className={classes.container}>
          <Link href="/trash">
            <Card shadow="md" radius="md" className={classes.card}>
              <IconTrash stroke={2}  />
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                Trash
              </Text>
              <Text fz="sm" c="dimmed" mt="sm">
                Check Trash Info
              </Text>
            </Card>
          </Link>
          <Link href="/plants">
            <Card shadow="md" radius="md" className={classes.card}>
              <IconPlant2  stroke={2}  />
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                Plants
              </Text>
              <Text fz="sm" c="dimmed" mt="sm">
                Manage the plants on the wild mile
              </Text>
            </Card>
          </Link>
          <Link href="/projects">
            <Card shadow="md" radius="md" className={classes.card}>
              <IconListDetails stroke={2}  />
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                Projects
              </Text>
              <Text fz="sm" c="dimmed" mt="sm">
                See the Current Wild Mile Projects
              </Text>
            </Card>
          </Link>
          {user && user.admin ?
            <Link href="/admin">
              <Card shadow="md" radius="md" className={classes.card} padding="xl">
                <IconUsers  stroke={2}  />
                <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                  Admin
                </Text>
                <Text fz="sm" c="dimmed" mt="sm">
                  Manage the users on the wild mile
                </Text>
              </Card>
            </Link> : <></>}
        </SimpleGrid>
      </Container>
    </>
  )
}
