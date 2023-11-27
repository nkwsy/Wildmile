import { useState } from 'react'
import {
  Stepper,
  Button,
  Group,
  Textarea,
  NumberInput,
  Paper,
  Title,
  Container,
  Select,
  LoadingOverlay,
  Affix
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks'
import { DateTimePicker } from '@mantine/dates'
import Router from 'next/router'
import TrashItemTable from '../../../components/trash_item_table'
import TrashItem from '../../../models/TrashItem'
import dbConnect from '../../../lib/db/setup'



export default function CreateLog(props) {
  const [errorMsg, setErrorMsg] = useState('')
  const [active, setActive] = useState(0)
  const [visible, handlers] = useDisclosure(false)

  const trashFormVals = Object.fromEntries(props.items.map((item) => {
    return [item.name, 0]
  }))

  const form = useForm({
    initialValues: {
        site: '',
        participants: 1,
        timeStart: new Date(),
        timeEnd: new Date(),
        trashiness: 1,
        temp: 65,
        wind: 1,
        cloud: 1,
        notes: '',
        items: trashFormVals
    },

    validate: (values) => {
      if (active === 0) {
          return {
              site: values.site === '' ? 'Must choose a site location' : null,
              timeEnd: values.timeEnd < values.timeStart ? "Time ended cannot be before time started" : null,
          }
      }

      return {}
    },
  })

  async function createLog() {
    handlers.open()
    console.log(form.values)
    const res = await fetch('/api/trash/logs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.values),
    })

    if (res.status === 201) {
      Router.push('/trash')
    } else {
      handlers.close()
      setErrorMsg(await res.text())
    }
  }

  const nextStep = () =>
    setActive((current) => {
      if (form.validate().hasErrors) {
        return current
      }
      return current < 2 ? current + 1 : current
    })

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

  return (
    <>
      <Container maw='95%' my={'xs'}>
        <LoadingOverlay visible={visible} overlayBlur={2} />
        <Paper withBorder shadow="md" p={'xs'} mt={30} radius="md">
          <Title
            mb={30}
            align="center"
            // sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
          >
            Create a new trash log
          </Title>
          <Stepper active={active} breakpoint="sm">
            <Stepper.Step label="First step" description="General Log Data">
              <Select
                label="Site"
                data={[
                  { value: 'General Wild Mile', label: 'General Wild Mile' },
                  { value: 'Riverwalk', label: 'Riverwalk' },
                  { value: 'Turning Basin', label: 'Turning Basin' },
                  { value: 'North West', label: 'North West' },
                  { value: 'North East', label: 'North East' },
                  { value: 'South West', label: 'South West' },
                  { value: 'South East', label: 'South East' },
                ]}
                {...form.getInputProps('site')}
              />
              <NumberInput
                defaultValue={1}
                label="Number of Participants"
                max={20}
                min={1}
                {...form.getInputProps('participants')}
              />
              <DateTimePicker
                suppressHydrationWarning
                dropdownType="modal"
                label="Time Start"
                placeholder="Pick date and time"
                maw={400}
                {...form.getInputProps('timeStart')}
              />
              <DateTimePicker
                suppressHydrationWarning
                dropdownType="modal"
                label="Time End"
                placeholder="Pick date and time"
                maw={400}
                {...form.getInputProps('timeEnd')}
              />
              {/* This needs to be explained better, what is a 12 vs a 1 */}
              <NumberInput
                defaultValue={1}
                label="Trash Level"
                max={12}
                min={1}
                {...form.getInputProps('trashiness')}
              />
              <NumberInput
                defaultValue={65}
                label="Temp (F)"
                max={120}
                min={0}
                {...form.getInputProps('temp')}
              />
              <Select
                label="Wind Speed"
                data={[
                  { value: 0, label: 'None' },
                  { value: 1, label: 'Barely Perceptible' },
                  { value: 2, label: 'Felt on face, leaves rustle' },
                  { value: 3, label: 'Leaves in constant motion' },
                  { value: 4, label: 'Branches moving, debris pushed around' },
                  { value: 5, label: 'Trees sway, noticeable waves' },
                ]}
                {...form.getInputProps('wind')}
              />
              <Select
                label="Cloud Cover"
                data={[
                  { value: 0, label: 'Clear' },
                  { value: 1, label: 'Partly Cloudy' },
                  { value: 2, label: 'Cloudy' },
                  { value: 3, label: 'Fog' },
                  { value: 4, label: 'Light Rain' },
                  { value: 5, label: 'Snow' },
                  { value: 6, label: 'Sleet' },
                  { value: 7, label: 'Showers' },
                ]}
                {...form.getInputProps('clouds')}
              />
              <Textarea label="Notes" {...form.getInputProps('notes')} />
            </Stepper.Step>
            <Stepper.Step label="Trash Items" description="Fill in details about trash that was recovered">
              <TrashItemTable items={props.items} form={form}/>
            </Stepper.Step>
            <Stepper.Completed>
              <p>The end</p>
            </Stepper.Completed>
          </Stepper>

          <Group position="right" mt="xl">
            {errorMsg && <p className="error">{errorMsg}</p>}
            {active !== 0 && (
              <Button variant="default" onClick={prevStep}>
                Back
              </Button>
            )}
            {active < 1 ? <Button onClick={nextStep}>Next step</Button> :       
            <Affix position={{ bottom: 20, right: 20 }}>
              <Button onClick={createLog}>Submit</Button>
            </Affix>}
          </Group>
        </Paper>
      </Container>
    </>
  )
}


export async function getStaticProps() {
  await dbConnect()

  /* find all the data in our database */
  const result = await TrashItem.find({ deleted: false }, ['-_id', '-creator', '-__v', '-createdAt', '-updatedAt', '-deleted'])
  const items = result.map((doc) => {
    return doc.toObject()
  })

  return { props: { items: items } }
}