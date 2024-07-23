"use client";
import {
  Container,
  Paper,
  TextInput,
  Button,
  Title,
  Text,
  Group,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import Link from "next/link";

export default function ForgotPassword() {
  const [emailSent, setEmailSent] = useState(false);

  const form = useForm({
    initialValues: {
      email: "",
    },

    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  async function handleSubmit(values) {
    const res = await fetch("/api/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.ok) {
      setEmailSent(true);
    } else {
      form.setErrors({ email: "Failed to send reset email" });
    }
  }

  return (
    <Container size={420} my="5rem">
      <Title align="center">Forgot your password?</Title>
      <Text color="dimmed" size="sm" align="center" mt={5}>
        Enter your email address below and we'll send you a link to reset your
        password.
      </Text>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {!emailSent ? (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <TextInput
              label="Email"
              placeholder="you@example.com"
              {...form.getInputProps("email")}
              required
            />
            <Button fullWidth mt="lg" type="submit">
              Send reset link
            </Button>
          </form>
        ) : (
          <Text color="green" align="center">
            Email sent! Check your inbox for the reset link.
          </Text>
        )}
        <Group position="center" mt="md">
          <Link href="/login">Back to login</Link>
        </Group>
      </Paper>
    </Container>
  );
}
