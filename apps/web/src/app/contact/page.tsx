import { type Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { ContactForm } from "@/components/forms/contact-form";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { site } from "@/config/site";

export const metadata: Metadata = pageMetadata({
  title: "Contact",
  description: `Get in touch with ${site.name}.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <Container size="prose" className="py-14 sm:py-20">
      <PageHeader
        eyebrow="contact"
        title="Say hello"
        description="Questions about a post, a project or a role? Drop a message and I will reply by email."
      />
      <div className="mt-10">
        <ContactForm />
      </div>
      <p className="mt-8 font-mono text-xs text-subtle">
        Prefer email?{" "}
        <a
          href={`mailto:${site.social.email}`}
          className="text-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {site.social.email}
        </a>
      </p>
    </Container>
  );
}
