import {  
  SimpleGrid, 
  Text, 
  Card, 
  Image, 
  Badge,
  Modal,
  Title,  
  Container } from '@mantine/core'
import dbConnect from '../../lib/db/setup'
import Plant from '../../models/Plant'
import { useStyles } from '../../components/image_card_grid'
import { useDisclosure } from '@mantine/hooks'

export default function Species(props) {
  const { classes, theme } = useStyles()
  const [opened, { open, close }] = useDisclosure(false)
  let selectedPlant = {}

  function setPlantModal(e) {
    console.log(e)
    console.log('opening modal')
    // selectedPlant = plant
  }

  const mappedPlantProps = props.plants.map((plant) => {
    return {
      title: plant.commonName || plant.scientificName,
      subtitle: plant.scientificName,
      image: plant.image_url || plant.botanicPhoto,
      desciption: plant.notes,
      tags: plant.synonyms.slice(0, 4),
      ...plant
    }
  })

  return (
    <>
      <Container maw='75%' my={40}>
        <Title order={2} className={classes.title} ta="center" mt="sm">Urban River Plants Resources</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <Modal opened={opened} onClose={close} title="Edit Plant" centered>
              <p>I am a modal</p>
              <p>{selectedPlant.title}</p>
            </Modal>
        <SimpleGrid mt={40} cols={4}>
        {mappedPlantProps.map((card) => {
          return (
            <>
            <Card key={card.title} onClick={() => {
              open()
              selectedPlant = card
            }} withBorder padding="lg" radius="md" className={classes.card}>
              <Card.Section mb="sm">
                <Image src={card.image} alt={card.title} />
              </Card.Section>

              {card.tags.map((tag) => {
                return (
                  <Badge>{tag.name || tag}</Badge>
                )
              })}


              <Text fw={700} className={classes.title} mt="xs">
                {card.title}
              </Text>
              <Text fw={700} className={classes.subtitle} mt="xs">
                {card.subtitle}
              </Text>

              <Text fz="sm" color="dimmed" lineClamp={6}>
                {card.description}
              </Text>
            </Card>
            </>
          )
        })}
      </SimpleGrid>
      </Container>
    </>
  )
}

/* Retrieves plant(s) data from mongodb database */
export async function getStaticProps() {
  await dbConnect()

  /* find all the data in our database */
  const result = await Plant.find({}, ['-_id', '-createdAt', '-updatedAt'])
  const plants = result.map((doc) => {
    const plant = doc.toObject()
    return plant
  })
  plants.sort(((a, b) => {
    const nameA = (a.scientific_name || a.scientificName).toUpperCase(); // ignore upper and lowercase
    const nameB = (b.scientific_name || b.scientificName).toUpperCase(); // ignore upper and lowercase
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }

    // names must be equal
    return 0;
  }))
  return { props: { plants: plants } }
}