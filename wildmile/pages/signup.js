import { useState } from 'react'
import {
  Stepper,
  Button,
  Group,
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Select,
  LoadingOverlay
} from '@mantine/core'
import { useForm } from '@mantine/form'
import { useDisclosure } from '@mantine/hooks';
import { useUser } from '../lib/hooks'
import Router from 'next/router'


export default function SignupPage() {
  const [user, { mutate }] = useUser()
  const [errorMsg, setErrorMsg] = useState('')
  const [active, setActive] = useState(0)
  const [visible, handlers] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      name: '',
      gender: '',
      location: '',
      website: '',
    },

    validate: (values) => {
      if (active === 0) {
        return {
          email: /^\S+@\S+$/.test(values.email.trim()) ? null : 'Invalid email',
          password:
            values.password.length < 8 ? 'Password must include at least 8 characters' : null,
        }
      }

      if (active === 1) {
        return {
          name: values.name.trim().length < 2 ? 'Name must include at least 2 characters' : null,
        }
      }

      return {}
    },
  })

  async function doSignup() {
    handlers.open()
    const res = await fetch('/api/user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form.values),
    })

    if (res.status === 201) {
      const userObj = await res.json()
      // set user to useSWR state
      mutate(userObj)
      Router.push('/home')
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
      return current < 3 ? current + 1 : current
    })

  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

  return (
    <>
      <Container maw='75%' my={40}>
        <LoadingOverlay visible={visible} overlayBlur={2} />
        <Paper withBorder shadow="md" p={30} mt={30} radius="md">
          <Title
            mb={30}
            align="center"
            sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
          >
            Become an Urban Ranger today!
          </Title>
          <Stepper active={active} breakpoint="sm">
            <Stepper.Step label="First step" description="Profile settings">
              <TextInput label="Email" placeholder="you@urbanriv.com" {...form.getInputProps('email')} />
              <PasswordInput
                mt="md"
                label="Password"
                placeholder="Password"
                {...form.getInputProps('password')}
              />
            </Stepper.Step>

            <Stepper.Step label="Second step" description="Personal information">
              <TextInput label="Name" placeholder="Name" {...form.getInputProps('name')} />
              <Select
                label="Your Pronouns"
                placeholder="Pick one"
                data={[
                  { value: 'He/Him', label: 'He/Him' },
                  { value: 'She/Her', label: 'She/Her' },
                  { value: 'They/Them', label: 'They/Them' },
                ]}
                {...form.getInputProps('gender')}
              />
            </Stepper.Step>

            <Stepper.Step label="Final step" description="Other Info">
              <TextInput label="Website" placeholder="Website" {...form.getInputProps('website')} />
              <TextInput
                label="What Neighborhood are you located in?"
                placeholder="Loop"
                {...form.getInputProps('location')}
              />
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
            {active < 2 && <Button onClick={nextStep}>Next step</Button>}
            {active === 2 && <Button onClick={doSignup}>Submit</Button>}
          </Group>
        </Paper>
      </Container>
    </>
  )
}