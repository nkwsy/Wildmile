import { Title, Text, Container} from '@mantine/core'
import { IconClipboardPlus, IconCalendarSearch } from '@tabler/icons-react';
import { useEffect } from 'react'
import Router from 'next/router'
import { useUser } from '../../lib/hooks'
import { useStyles, IconCardGrid } from '../../components/icon_card_grid'

export default function TrashLanding() {
  const [user, { loading }] = useUser()
  const { classes, theme } = useStyles()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])


  const cards = [
    {
      icon: IconClipboardPlus,
      title: 'Add New Trash Log',
      href: '/trash/log',
      description: 'Create a new trash log '
    },
    {
      icon: IconCalendarSearch,
      title: 'Past Logs',
      href: '/trash/history',
      description: 'View and Edit previous trash logs'
    }
  ]

  return (
    <>
      <Container maw='75%' my={40}>
        <Title order={2} className={classes.title} ta="center" mt="sm">Urban River Trash Resources</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <IconCardGrid cards={cards} />
      </Container>
    </>
  )
}