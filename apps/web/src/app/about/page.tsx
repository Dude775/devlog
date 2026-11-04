import { type Metadata } from "next";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowUpRight, GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";
import { Prose } from "@/components/ui/prose";
import { site } from "@/config/site";

export const metadata: Metadata = { title: "About", description: `About ${site.name}.` };

export default function AboutPage() {
  return (
    <Container size="prose" className="py-14 sm:py-20">
      <PageHeader eyebrow="about" title={site.name} description={site.role} />
      <Prose className="mt-10">
        <p>
          I build and operate the plumbing that ships software: CI/CD pipelines, containers, cloud
          infrastructure on AWS, and increasingly, AI agents and automation that remove toil from
          real workflows.
        </p>
        <p>
          This blog is where I write the engineering story behind my projects: the trade-offs, the
          failures and the fixes. For the polished overview of what I have built, head to the
          portfolio.
        </p>
      </Prose>
      <div className="mt-10 flex flex-wrap gap-3">
        <a
          href={site.portfolioUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants()}
        >
          View portfolio <ArrowUpRight />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
        <a
          href={site.social.github}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          <GitHubIcon /> GitHub
        </a>
        <a
          href={site.social.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "secondary" })}
        >
          <LinkedInIcon /> LinkedIn
        </a>
        <a href={`mailto:${site.social.email}`} className={buttonVariants({ variant: "ghost" })}>
          <MailIcon /> {site.social.email}
        </a>
      </div>
    </Container>
  );
}
