"use client";
import {
  Paper,
  TextInput,
  PasswordInput,
  Select,
  Button,
  Avatar,
  Container,
} from "@mantine/core";
import { useForm, isEmail } from "@mantine/form";
import { useEffect } from "react";
import { useUser } from "../../lib/hooks";
import { useRouter } from "next/navigation";
import getAvatar from "../../lib/avatar.js";

export default function ProfilePage() {
  const { user, loading, mutate } = useUser();
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: "",
      password: "",
      name: "",
      location: "",
    },

    validate: (values) => {
      return {
        // email: isEmail('Invalid email'), // This doesn't seem to work
        password:
          values.password.length < 8 && values.password.length !== 0
            ? "Password must include at least 8 characters"
            : null,
        name:
          values.name.trim().length < 2
            ? "Name must include at least 2 characters"
            : null,
      };
    },
  });

  useEffect(() => {
    if (!user || !user.profile) return;
    form.setFieldValue("email", user.email || "");
    form.setFieldValue("name", user.profile.name || "");
    form.setFieldValue("location", user.profile.location || "");
  }, [user]);

  useEffect(() => {
    // redirect user to login if not authenticated
    if (!loading && !user) router.replace("/login");
  }, [user, loading]);

  let photoSrc = `data:image/svg+xml;utf8,${encodeURIComponent(
    getAvatar(user && user.profile ? user.profile.name : "default")
  )}`;

  async function handleEditProfile(values) {
    // Its ok if other values are empty but not email and password
    if (!values.email) {
      delete values.email;
    }
    if (!values.password) {
      delete values.password;
    }

    console.log(values);

    const res = await fetch(`/api/user`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const updatedUser = await res.json();

    mutate(updatedUser);
  }

  return (
    <Container maw="50%" my="7rem">
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Avatar
          src={photoSrc}
          alt={
            user && user.profile ? user.profile.name || "Username" : "Username"
          }
          size={250}
        />
        <form
          onSubmit={form.onSubmit((values) => {
            handleEditProfile(values);
          })}
        >
          <TextInput
            label="Email"
            placeholder="you@urbanriv.com"
            {...form.getInputProps("email")}
          />
          <PasswordInput
            mt="md"
            label="New Password"
            placeholder="Password"
            {...form.getInputProps("password")}
          />
          <TextInput
            label="Name"
            placeholder="Name"
            {...form.getInputProps("name")}
          />
          <TextInput
            label="What Neighborhood are you located in?"
            placeholder="Loop"
            {...form.getInputProps("location")}
          />
          <Button mt="xl" type="submit">
            Update Profile
          </Button>
        </form>
      </Paper>
    </Container>
  );
}
