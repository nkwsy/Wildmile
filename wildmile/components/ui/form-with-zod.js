"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

function FormWithZod({
  schema,
  defaultValues,
  onSubmit,
  children,
  className,
  submitText = "Submit",
  resetText = "Reset",
  showReset = true,
}) {
  const form = useForm({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues,
  })

  const handleSubmit = (data) => {
    if (onSubmit) {
      onSubmit(data, form)
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className={cn("space-y-6", className)}
      >
        {typeof children === "function" ? children(form) : children}
        <div className="flex items-center justify-end gap-2">
          {showReset && (
            <Button
              type="button"
              variant="outline"
              onClick={() => form.reset()}
            >
              {resetText}
            </Button>
          )}
          <Button type="submit">{submitText}</Button>
        </div>
      </form>
    </Form>
  )
}

export { FormWithZod } 