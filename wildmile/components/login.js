import {
  TextInput,
  PasswordInput,
  Checkbox,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Button,
} from '@mantine/core'
import { useForm, isEmail } from '@mantine/form'
import { useState, useEffect } from 'react'
import Router from 'next/router'
import Link from 'next/link'
import { useUser } from '../lib/hooks'

export default function Login() {
  const [user, { mutate }] = useUser()
  const [errorMsg, setErrorMsg] = useState('')

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },

    validate: {
      email: isEmail('Invalid email'),
    },
  })

  async function doLogin(values) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })

    if (res.status === 200) {
      const userObj = await res.json()
      // set user to useSWR state
      mutate(userObj)
    } else {
      setErrorMsg('Incorrect email or password.')
    }
  }

  useEffect(() => {
    // redirect to home if user is authenticated
    if (user) Router.push('/home')
  }, [user])

  return (
    <Container size={420} my={40}>
      <Title
        align="center"
        sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
      >
        Welcome back!
      </Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Do not have an account yet?{' '}
        <Link href="/signup">
          <Anchor size="sm" component="button">
            Create account
          </Anchor>
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit((values) => {doLogin(values)})}>
        <TextInput label="Email" placeholder="you@urbanriv.com" required {...form.getInputProps('email')} />
        <PasswordInput label="Password" placeholder="Your password" required mt="md" {...form.getInputProps('password')} />
        <Group position="apart" mt="lg">
          <Text size='sm' color='red'>{errorMsg}</Text>
          <Anchor component="button" size="sm">
            Forgot password?
          </Anchor>
        </Group>
        <Button fullWidth mt="xl" type="submit">
          Sign in
        </Button>
        </form>
      </Paper>
    </Container>
  )
}