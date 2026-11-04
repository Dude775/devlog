import { type ContactResponse, type contactRequestSchema } from "@devlog/shared/schemas";
import { type z } from "zod";
import { type ContactRepository } from "../repositories/contact.repository";

export type ContactInput = z.output<typeof contactRequestSchema>;

export interface ContactService {
  submit: (input: ContactInput) => Promise<ContactResponse & { spam: boolean }>;
}

export function createContactService({
  repository,
}: {
  repository: ContactRepository;
}): ContactService {
  return {
    async submit({ name, email, message, website }) {
      // Honeypot hit: pretend success so bots learn nothing.
      if (website) return { status: "received", spam: true };
      await repository.create({ name, email, message });
      return { status: "received", spam: false };
    },
  };
}
