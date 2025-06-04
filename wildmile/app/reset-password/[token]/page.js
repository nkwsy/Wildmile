"use client";
import {
  Container,
  Paper,
  PasswordInput,
  Button,
  Title,
  Group,
} from "@mantine/core";
import Link from "next/link";
import { useForm } from "@mantine/form";
// import { useRouter } from "next/navigation";
import { useState } from "react";
import { use } from "react";

export default function Page({ params }) {
  // const router = useRouter();
  const { token } = use(params);
  const [passwordChanged, setPasswordChanged] = useState(false);

  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },

    validate: {
      password: (value) =>
        value.length < 6 ? "Password must be at least 6 characters" : null,
      confirmPassword: (value, values) =>
        value !== values.password ? "Passwords must match" : null,
    },
  });

  async function handleSubmit(values) {
    const res = await fetch(`/api/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });

    if (res.ok) {
      setPasswordChanged(true);
    } else {
      form.setErrors({ password: "Failed to reset password" });
    }
  }

  return (
    <Container size={420} my="5rem">
      <Title align="center">Reset Your Password</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        {!passwordChanged ? (
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <PasswordInput
              label="New Password"
              placeholder="Enter new password"
              {...form.getInputProps("password")}
              required
            />
            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm new password"
              {...form.getInputProps("confirmPassword")}
              required
              mt="md"
            />
            <Button fullWidth mt="lg" type="submit">
              Reset Password
            </Button>
          </form>
        ) : (
          <Group position="center" mt="md">
            Password successfully changed. <Link href="/login">Log in</Link>
          </Group>
        )}
      </Paper>
    </Container>
  );
}
