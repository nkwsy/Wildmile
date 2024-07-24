"use client";
import { useState } from "react";
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
  Affix,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
// import Router from "next/router";
import { useRouter } from "next/navigation";

import { revalidatePath } from "next/cache";
import TrashForm from "./trash_form";

export default function TrashLogForm() {
  const router = useRouter(); // Step 2: Initialize useRouter

  const [errorMsg, setErrorMsg] = useState("");
  const [active, setActive] = useState(0);
  const [visible, handlers] = useDisclosure(false);
  const [loading, { toggle }] = useDisclosure();

  const isBrowser = () => typeof window !== "undefined"; //The approach recommended by Next.js

  function scrollToTop() {
    if (!isBrowser()) return;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const form = useForm({
    initialValues: {
      site: "",
      participants: 1,
      timeStart: new Date(),
      timeEnd: new Date(),
      trashiness: 1,
      temp: 65,
      wind: 1,
      cloud: 1,
      notes: "",
    },

    validate: (values) => {
      if (active === 0) {
        return {
          site: values.site === "" ? "Must choose a site location" : null,
          timeEnd:
            values.timeEnd < values.timeStart
              ? "Time ended cannot be before time started"
              : null,
        };
      }

      return {};
    },
  });

  async function createLog() {
    toggle(); // Managing loading state
    const res = await fetch("/api/trash/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form.values),
    });

    if (res.status === 201) {
      const data = await res.json();
      const id = data._id;

      revalidatePath("/trash");
      router.push(`/trash/${id}`); // Use the useRouter instance for navigation
    } else {
      setErrorMsg(await res.text()); // Set error message from API response
    }
  }

  return (
    <>
      <TrashForm form={form} />
      <Group justify="right" mt="xl">
        <Button onClick={createLog} loading={loading}>
          Submit
        </Button>
      </Group>
    </>
  );
}
