import { createStyles, SimpleGrid, Title, Text, Container, Card, rem } from '@mantine/core'
import { IconTrash, IconPlant2, IconListDetails, IconUsers } from '@tabler/icons-react'
import { useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../lib/hooks'

const useStyles = createStyles((theme) => ({
  title: {
    fontSize: rem(34),
    fontWeight: 900,

    [theme.fn.smallerThan('sm')]: {
      fontSize: rem(24),
    },
  },

  description: {
    maxWidth: 600,
    margin: 'auto',

    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
      marginLeft: 'auto',
      marginRight: 'auto',
    },
  },

  card: {
    border: `${rem(1)} solid ${theme.colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[1]
      }`,
    ...theme.fn.hover({
      backgroundColor: theme.colorScheme === 'dark' ? theme.colors.dark[6] : theme.colors.gray[0],
    }),
  },

  cardTitle: {
    '&::after': {
      content: '""',
      display: 'block',
      backgroundColor: theme.fn.primaryColor(),
      width: rem(45),
      height: rem(2),
      marginTop: theme.spacing.sm,
    },
  },
}))

export default function HomePage() {
  const { classes, theme } = useStyles()
  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

  return (
    <>
      <Container maw='75%' my={40}>
        <Title order={2} className={classes.title} ta="center" mt="sm">Home Page</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <SimpleGrid mt={40} cols={2}>
          <Link href="/trash">
            <Card shadow="md" radius="md" className={classes.card} padding="xl">
              <IconTrash size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                Trash
              </Text>
              <Text fz="sm" c="dimmed" mt="sm">
                Check Trash Info
              </Text>
            </Card>
          </Link>
          <Link href="/plants">
            <Card shadow="md" radius="md" className={classes.card} padding="xl">
              <IconPlant2 size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
              <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
                Plants
              </Text>
              <Text fz="sm" c="dimmed" mt="sm">
                Manage the plants on the wild mile
              </Text>
            </Card>
          </Link>
          <Link href="/projects">
            <Card shadow="md" radius="md" className={classes.card} padding="xl">
              <IconListDetails size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
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
                <IconUsers size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
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
