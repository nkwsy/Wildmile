import { createStyles, SimpleGrid, Title, Text, Container, Card, rem } from '@mantine/core'
import { IconListDetails } from '@tabler/icons-react'
import { useEffect } from 'react'
import { Router, useRouter } from 'next/router'
import Link from 'next/link'
import { useUser } from '../../../../lib/hooks'
import dbConnect from '../../../../lib/db/setup'
import Section from '../../../../models/Section'
import Module from '../../../../models/Module'

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

export default function ProjectSectionLanding(props) {
  const router = useRouter()
  const { classes, theme } = useStyles()
  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

  const modules = props.modules.map((module) => {
    return (
      <Link key={module._id} href={"/projects/" + router.query.id + "/modules/" + module._id}>
        <Card shadow="md" radius="md" className={classes.card} padding="xl">
          <IconListDetails size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
          <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
            {`X: ${module.x}, Y: ${module.y}`}
          </Text>
          <Text fz="sm" c="dimmed" mt="sm">
            {`Model: ${module.model} - Shape: ${module.shape}`}
          </Text>
          <Text fz="sm" c="dimmed" mt="sm">
            {module.notes}
          </Text>
        </Card>
      </Link>
    )
  })

  return (
    <>
      <Container maw='75%' my={40}>
        <Title order={2} className={classes.title} ta="center" mt="sm">{router.query.id + "'s modules"}</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          modules for this project
        </Text>
        <SimpleGrid mt={40} cols={2}>
          {modules}
        </SimpleGrid>
      </Container>
    </>
  )
}

/* Retrieves plant(s) data from mongodb database */
export async function getServerSideProps(context) {
  const section_name = context.params.sid
  await dbConnect()

  const section = await Section.findOne({ name: section_name })
  const result = await Module.find({ section: section._id })

  const modules = result.map((doc) => {
    const module = doc.toObject()
    module._id = String(module._id)
    module.section = String(module.section)
    return module
  })

  return { props: { modules: modules } }
}