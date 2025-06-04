"use client";
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
  Tooltip,
} from "@mantine/core";
import { useForm, isEmail } from "@mantine/form";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "lib/hooks";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
export default function Login() {
  const { user, loading, mutate } = useUser();
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },

    validate: {
      email: isEmail("Invalid email"),
    },
  });

  async function doLogin(values) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.status === 200) {
      const userObj = await res.json();
      // set user to useSWR state
      mutate(userObj);
    } else {
      setErrorMsg(
        "Incorrect email or password. This is not the same as Galaxy digital. You must create an account here."
      );
    }
  }

  useEffect(() => {
    // redirect to home if user is authenticated
    if (user) router.push(callbackUrl);
  }, [user]);

  return (
    <Container size={420} my="5rem">
      <Title
        align="center"
        // sx={(theme) => ({ fontFamily: `Greycliff CF, ${theme.fontFamily}`, fontWeight: 900 })}
      >
        Welcome back!
      </Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Do not have an account yet?{" "}
        <Link href="/signup">
          <Anchor size="sm" component="button">
            Create account
          </Anchor>
        </Link>
      </Text>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form
          onSubmit={form.onSubmit((values) => {
            doLogin(values);
          })}
        >
          <TextInput
            label="Email"
            placeholder="you@urbanriv.com"
            required
            {...form.getInputProps("email")}
          />

          <PasswordInput
            label="Password"
            placeholder="Your password"
            required
            mt="md"
            {...form.getInputProps("password")}
          />
          <Group position="apart" mt="lg">
            <Text size="sm" color="red">
              {errorMsg}
            </Text>
            <Anchor component={Link} href="/forgot-password" size="sm">
              Forgot password?
            </Anchor>
          </Group>
          <Button fullWidth mt="xl" type="submit">
            Sign in
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
