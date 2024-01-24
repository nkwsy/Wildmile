import { Title, Text, Container} from '@mantine/core'
import { IconListDetails } from '@tabler/icons-react'
import { useEffect } from 'react'
import { Router, useRouter } from 'next/router'
import { useUser } from '../../../../lib/hooks'
import dbConnect from '../../../../lib/db/setup'
import Section from '../../../../models/Section'
import Project from '../../../../models/Project'
import { cardStyles, IconCardGrid } from '../../../../components/icon_card_grid'

export default function ProjectSectionLanding(props) {
  const router = useRouter()
  const { classes, theme } = cardStyles()
  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

  const sections = props.sections.map((section) => {
    return {
      icon: IconListDetails,
      title: section.name,
      href: `/projects/${router.query.id}/sections/${section.name}`,
      description: section.description
    }
  })

  return (
    <>
      <Container maw='75%' my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">{router.query.id + "'s Sections"}</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Sections for this project
        </Text>
        <IconCardGrid cards={sections} />
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