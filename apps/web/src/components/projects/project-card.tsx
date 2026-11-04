import { type Project } from "#site/content";
import { type Route } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowUpRight, GitHubIcon } from "@/components/ui/icons";
import { type PostSummary, portfolioUrlFor } from "@/lib/content";
import { cn } from "@/lib/cn";

export interface ProjectCardProps {
  project: Project;
  /** Blog posts written about this project. Omit to hide the list. */
  posts?: PostSummary[];
  /** Eyebrow label, e.g. "Related project". */
  label?: string;
  headingLevel?: "h2" | "h3";
  className?: string;
}

/** Compact project card. Detail lives on the portfolio; this links out to it and to the repo. */
export function ProjectCard({
  project,
  posts,
  label,
  headingLevel = "h3",
  className,
}: ProjectCardProps) {
  const Heading = headingLevel;
  return (
    <Card id={project.slug} className={cn("flex h-full scroll-mt-24 flex-col", className)}>
      {label && (
        <p className="font-mono text-xs tracking-widest text-accent-text uppercase">
          <span aria-hidden>{"// "}</span>
          {label}
        </p>
      )}
      <Heading className={cn("font-mono text-lg font-semibold text-fg", label && "mt-2")}>
        {project.name}
      </Heading>
      <p className="mt-1.5 text-sm text-muted">{project.summary}</p>

      {project.stack.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Tech stack">
          {project.stack.map((s) => (
            <li key={s}>
              <Badge>{s}</Badge>
            </li>
          ))}
        </ul>
      )}

      {posts && posts.length > 0 && (
        <div className="mt-5 border-t border-border pt-4">
          <p className="font-mono text-xs text-subtle">Writing about {project.name}</p>
          <ul className="mt-2 space-y-1.5">
            {posts.map((p) => (
              <li key={p.slug}>
                <Link
                  href={p.permalink as Route}
                  dir={p.dir}
                  className={cn(
                    "text-sm text-fg underline-offset-4 hover:text-accent-text hover:underline",
                    p.dir === "rtl" && "font-hebrew",
                  )}
                >
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-sm">
        <a
          href={project.repo}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-muted transition-colors hover:text-fg"
        >
          <GitHubIcon /> Repository
          <span className="sr-only">for {project.name} (opens in a new tab)</span>
        </a>
        <a
          href={portfolioUrlFor(project)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-accent-text transition-colors hover:text-fg"
        >
          Full case study on portfolio <ArrowUpRight />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </Card>
  );
}
