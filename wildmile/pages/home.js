import { Title, Text, Container } from '@mantine/core'
import { IconTrash, IconPlant2, IconListDetails, IconUsers } from '@tabler/icons-react'
import { useEffect } from 'react'
import Router from 'next/router'
import { IconCardGrid } from '../components/icon_card_grid'
import { useUser } from '../lib/hooks'
import classes from '/styles/card.module.css'

export default function HomePage() {
  const [user, { loading }] = useUser()

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) Router.replace('/')
  }, [user, loading])

  const cards = [
    {
      icon: IconTrash,
      title: 'Trash',
      href: '/trash',
      description: 'Check Trash Info'
    },
    {
      icon: IconPlant2,
      title: 'Plants',
      href: '/plants',
      description: 'Manage the plants on the wild mile'
    },
    // Projects is broken for the moment
    // {
    //   icon: IconListDetails,
    //   title: 'Projects',
    //   href: '/projects',
    //   description: 'See the Current Wild Mile Projects'
    // }
  ]

  user && user.admin ?
    cards.push({
      icon: IconUsers,
      title: 'Admin',
      href: '/admin',
      description: 'Manage the users on the wild mile'
    }) : null



  return (
    <>
      <Container maw='85%' my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">Home Page</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <IconCardGrid cards={cards} />
      </Container>
    </>
  )
}
