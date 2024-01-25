import {
  SimpleGrid,
  Text,
  Card,
  Image,
  Badge,
  Modal,
  Title,
  Container,
  TextInput,
  Textarea,
  Button
} from '@mantine/core'
import dbConnect from '../../lib/db/setup'
import Plant from '../../models/Plant'
import { useStyles } from '../../components/image_card_grid'
import { useDisclosure } from '@mantine/hooks'
import { useForm } from '@mantine/form'
import classes from '/styles/imagecard.module.css'

export default function Species(props) {
  const [opened, { open, close }] = useDisclosure(false)

  const form = useForm({
    initialValues: {
      _id: '',
      scientific_name: '',
      common_name: '',
      notes: '',
      image_url: '',
    },

    validate: {
    },
  })

  const mappedPlantProps = props.plants.map((plant) => {
    return {
      ...plant,
      title: plant.commonName || plant.common_name || plant.scientificName,
      subtitle: plant.scientificName || plant.scientific_name,
      image: plant.thumbnail,
      description: plant.notes,
      tags: plant.synonyms.slice(0, 4),
    }
  })

  function update_form_values(plant) {
    form.setFieldValue('_id', plant._id)
    form.setFieldValue('scientific_name', plant.scientific_name || plant.scientificName)
    form.setFieldValue('common_name', plant.common_name || plant.commonName)
    form.setFieldValue('image_url', plant.image_url || plant.botanicPhoto)
    form.setFieldValue('notes', plant.notes)
  }

  async function updatePlant(e) {
    let body = form.values
    const id = body._id
    delete body._id

    const res = await fetch('/api/plant/' + id, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 200) {
      console.log(await res.json())
      close()
    } else {
      //error
    }
  }

  return (
    <>
      <Container maw='85%' my="5rem">
        <Title order={2} className={classes.title} ta="center" mt="sm">Urban River Plants Resources</Title>
        <Text c="dimmed" className={classes.description} ta="center" mt="md">
          Collecting and sharing data about Urban River's projects.
        </Text>
        <Modal opened={opened} onClose={close} title="Edit Plant" centered>
          <form>
            <TextInput label="Scientific Name" {...form.getInputProps('scientific_name')} />
            <TextInput label="Common Name" {...form.getInputProps('common_name')} />
            <TextInput label="Image URL" {...form.getInputProps('image_url')} />
            <Textarea label="Notes" {...form.getInputProps('notes')} />
            <Button fullWidth mt="xl" onClick={updatePlant}>
              Update
            </Button>
          </form>
        </Modal>
        <SimpleGrid 
        mt={40} 
        // cols={4}
         cols={{ base: 2, sm: 2, lg:5, xl: 8 }}
        breakpoints={[
          { maxWidth: '62rem', cols: 3, spacing: 'md' },
          { maxWidth: '48rem', cols: 2, spacing: 'sm' },
          { maxWidth: '36rem', cols: 1, spacing: 'sm' },
        ]}>
          {mappedPlantProps.map((plant, index) => {
            return (
              <Card key={plant.title + String(index)} onClick={() => {
                open()
                update_form_values(plant)
              }} withBorder padding="lg" radius="md" className={classes.mantineCard}>
                <Card.Section mb="sm">
                  <Image src={plant.image || '/No_plant_image.jpg'} alt={plant.title}  />
                </Card.Section>
                <Title fw={700} className={classes.title} mt="xs">
                  {plant.title}
                </Title>
                <Text fs="italic" fw={700} className={classes.subtitle} c='dimmed'>
                  {plant.subtitle}
                </Text>
                {/* <Text mb='xs'>
                  {plant.description}
                </Text> */}
              </Card>
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
  const result = await Plant.find({}, ['-createdAt', '-updatedAt'])
  const plants = result.map((doc) => {
    const plant = doc.toObject()
    plant._id = String(plant._id)
    return plant
  })
  plants.sort(((a, b) => {
    const nameA = (a.scientific_name || a.scientificName).toUpperCase() // ignore upper and lowercase
    const nameB = (b.scientific_name || b.scientificName).toUpperCase() // ignore upper and lowercase
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }

    // names must be equal
    return 0
  }))
  return { props: { plants: plants } }
}