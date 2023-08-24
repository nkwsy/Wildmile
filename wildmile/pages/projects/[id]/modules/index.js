import { createStyles, SimpleGrid, Title, Text, Container, Card, rem } from '@mantine/core'
import { IconListDetails } from '@tabler/icons-react'
import { useEffect } from 'react'
import { Router, useRouter } from 'next/router'
import Link from 'next/link'
import { useUser } from '../../../../lib/hooks'
import dbConnect from '../../../../lib/db/setup'
import Section from '../../../../models/Section'
import Project from '../../../../models/Project'

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

  const sections = props.sections.map((section) => {
    return (
      <Link key={section.name} href={"/projects/" + router.query.id + "/sections/" + section.name}>
        <Card shadow="md" radius="md" className={classes.card} padding="xl">
          <IconListDetails size={rem(50)} stroke={2} color={theme.fn.primaryColor()} />
          <Text fz="lg" fw={500} className={classes.cardTitle} mt="md">
            {section.name}
          </Text>
          <Text fz="sm" c="dimmed" mt="sm">
            {section.description}
          </Text>
        </Card>
      </Link>
    )
  })

  return (
    <>
      <Container maw='75%' my={40}>
        <Title order={2} className={classes.title} ta="center" mt="sm">{router.query.id + "'s Sections"}</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Sections for this project
        </Text>
        <SimpleGrid mt={40} cols={2}>
          {sections}
        </SimpleGrid>
      </Container>
    </>
  )
}

/* Retrieves plant(s) data from mongodb database */
export async function getServerSideProps(context) {
  const project_name = context.params.id
  await dbConnect()

  const project = await Project.findOne({ name: project_name })
  const result = await Section.find({ project: project._id }, ['-createdAt', '-updatedAt'])

  const sections = result.map((doc) => {
    const section = doc.toObject()
    section._id = String(section._id)
    section.project = String(section.project)
    return section
  })

  return { props: { sections: sections } }
}