import { createStyles, SimpleGrid, Title, Text, Container, Card, rem } from '@mantine/core'
import { IconListDetails } from '@tabler/icons-react'
import { useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../../../lib/hooks'
import { useRouter } from 'next/router'

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

export default function ProjectLanding() {
  const router = useRouter()
  const { classes, theme } = useStyles()
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
        <Link href={"/projects/" + router.query.id + "/islands"}>
        <Card shadow="md" radius="md" className={classes.card} padding="xl">
          <IconListDetails size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
          <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
            Island
          </Text>
          <Text fz="sm" c="dimmed" mt="sm">
            View and Edit islands
          </Text>
        </Card>
      </Link>
        </SimpleGrid>
      </Container>
    </>
  )
}

