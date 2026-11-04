"use client";

import { subscribeRequestSchema } from "@devlog/shared/schemas";
import { type SyntheticEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { site } from "@/config/site";
import { getBrowserApi } from "@/lib/api-browser";
import { Honeypot, Input } from "./field";
import { failureMessage, type SubmitState } from "./submit-state";

export function NewsletterForm() {
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function onSubmit(e: SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const parsed = subscribeRequestSchema.safeParse({
      email: data.get("email"),
      website: data.get("website") ?? undefined,
    });
    if (!parsed.success) {
      setState({ kind: "error", message: "Please enter a valid email address." });
      return;
    }
    setState({ kind: "submitting" });
    try {
      await getBrowserApi().subscribe(parsed.data);
      setState({ kind: "success" });
    } catch (error) {
      setState({
        kind: "error",
        message: failureMessage(
          error,
          `Subscriptions are unavailable right now. You can email ${site.social.email} instead.`,
        ),
      });
    }
  }

  if (state.kind === "success") {
    return (
      <p role="status" className="font-mono text-xs text-accent-text">
        <span aria-hidden>✓ </span>Thanks! You are on the list.
      </p>
    );
  }

  return (
    <form onSubmit={(e) => void onSubmit(e)} noValidate className="relative w-full max-w-sm">
      <label htmlFor="newsletter-email" className="font-mono text-xs text-subtle">
        <span className="text-accent-text">$</span> subscribe --new-posts
      </label>
      <div className="mt-2 flex gap-2">
        <Input
          id="newsletter-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          disabled={state.kind === "submitting"}
          aria-describedby={state.kind === "error" ? "newsletter-msg" : undefined}
        />
        <Button type="submit" disabled={state.kind === "submitting"}>
          {state.kind === "submitting" ? "…" : "Subscribe"}
        </Button>
      </div>
      <Honeypot />
      {state.kind === "error" && (
        <p id="newsletter-msg" role="status" className="mt-2 text-xs text-muted">
          {state.message}
        </p>
      )}
    </form>
  );
}
