"use client";

import { contactRequestSchema } from "@devlog/shared/schemas";
import { type SyntheticEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { getBrowserApi } from "@/lib/api-browser";
import { Honeypot, Input, Textarea } from "./field";
import { failureMessage, type SubmitState } from "./submit-state";

type FieldErrors = Partial<Record<"name" | "email" | "message", string>>;

export function ContactForm() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });
  const [errors, setErrors] = useState<FieldErrors>({});

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const parsed = contactRequestSchema.safeParse({
      name: data.get("name"),
      email: data.get("email"),
      message: data.get("message"),
      website: data.get("website") ?? undefined,
    });
    if (!parsed.success) {
      const next: FieldErrors = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0];
        if (key === "name") next.name = "Please enter your name.";
        if (key === "email") next.email = "Please enter a valid email address.";
        if (key === "message") next.message = "Message must be 10 to 5000 characters.";
      }
      setErrors(next);
      setState({ kind: "idle" });
      return;
    }
    setErrors({});
    setState({ kind: "submitting" });
    try {
      await getBrowserApi().contact(parsed.data);
      form.reset();
      setState({ kind: "success" });
    } catch (error) {
      setState({
        kind: "error",
        message: failureMessage(
          error,
          `The contact form is unavailable right now. Please email ${site.social.email}.`,
        ),
      });
    }
  }

  if (state.kind === "success") {
    return (
      <div role="status" className="rounded-xl border border-accent/40 bg-accent-soft p-5">
        <p className="font-medium text-fg">Message sent.</p>
        <p className="mt-1 text-sm text-muted">Thanks for reaching out. I will reply by email.</p>
      </div>
    );
  }

  const busy = state.kind === "submitting";
  const describe = (field: keyof FieldErrors) =>
    errors[field] ? { "aria-invalid": true, "aria-describedby": `contact-${field}-error` } : {};

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="relative grid gap-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="contact-name" className="text-sm font-medium text-fg">
            Name
          </label>
          <Input
            id="contact-name"
            name="name"
            required
            maxLength={100}
            autoComplete="name"
            disabled={busy}
            className="mt-1.5"
            {...describe("name")}
          />
          <FieldError id="contact-name-error" message={errors.name} />
        </div>
        <div>
          <label htmlFor="contact-email" className="text-sm font-medium text-fg">
            Email
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            disabled={busy}
            className="mt-1.5"
            {...describe("email")}
          />
          <FieldError id="contact-email-error" message={errors.email} />
        </div>
      </div>
      <div>
        <label htmlFor="contact-message" className="text-sm font-medium text-fg">
          Message
        </label>
        <Textarea
          id="contact-message"
          name="message"
          required
          minLength={10}
          maxLength={5000}
          disabled={busy}
          className="mt-1.5"
          {...describe("message")}
        />
        <FieldError id="contact-message-error" message={errors.message} />
      </div>
      <Honeypot />
      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send message"}
        </Button>
        {state.kind === "error" && (
          <p role="status" className="text-sm text-muted">
            {state.message}
          </p>
        )}
      </div>
    </form>
  );
}

function FieldError({ id, message }: { id: string; message: string | undefined }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-muted">
      {message}
    </p>
  );
}
