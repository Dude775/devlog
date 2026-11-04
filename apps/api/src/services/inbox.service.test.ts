import { describe, expect, it } from "vitest";
import { createFakeStore } from "../testing/fakes";
import { createContactService } from "./contact.service";
import { createNewsletterService } from "./newsletter.service";

describe("newsletter service", () => {
  it("creates, then reports duplicates, always returning pending", async () => {
    const fake = createFakeStore();
    const service = createNewsletterService({ repository: fake.repos.subscribers });
    await expect(service.subscribe({ email: "a@example.com" })).resolves.toEqual({
      status: "pending",
      outcome: "created",
    });
    await expect(service.subscribe({ email: "a@example.com" })).resolves.toEqual({
      status: "pending",
      outcome: "duplicate",
    });
  });

  it("drops honeypot submissions without touching storage", async () => {
    const fake = createFakeStore();
    const service = createNewsletterService({ repository: fake.repos.subscribers });
    await expect(
      service.subscribe({ email: "bot@example.com", website: "x" }),
    ).resolves.toMatchObject({ outcome: "spam" });
    expect(fake.state.writes).toEqual([]);
  });
});

describe("contact service", () => {
  const msg = { name: "Ada", email: "ada@example.com", message: "Hello there!" };

  it("persists legitimate messages", async () => {
    const fake = createFakeStore();
    const service = createContactService({ repository: fake.repos.contact });
    await expect(service.submit(msg)).resolves.toEqual({ status: "received", spam: false });
    expect(fake.state.messages).toEqual([msg]);
  });

  it("drops honeypot submissions but still answers received", async () => {
    const fake = createFakeStore();
    const service = createContactService({ repository: fake.repos.contact });
    await expect(service.submit({ ...msg, website: "http://spam" })).resolves.toEqual({
      status: "received",
      spam: true,
    });
    expect(fake.state.messages).toEqual([]);
  });
});
