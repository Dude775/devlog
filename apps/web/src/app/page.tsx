import { type Route } from "next";
import Link from "next/link";
import { PostCard } from "@/components/blog/post-card";
import { Terminal, type TerminalLine } from "@/components/home/terminal";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Container } from "@/components/ui/container";
import { ArrowRight, ArrowUpRight } from "@/components/ui/icons";
import { Section } from "@/components/ui/section";
import { site } from "@/config/site";
import {
  getCategoriesWithCounts,
  getFeaturedPosts,
  getFeaturedProjects,
  getPostsByProject,
  toSummary,
} from "@/lib/content";

const intro: TerminalLine[] = [
  {
    command: "whoami",
    output: [
      "david rubin · devops & cloud engineer",
      "aws certified solutions architect - associate",
    ],
  },
  {
    command: "cat focus.txt",
    output: ["ci/cd · containers · iac · ai agents · automation pipelines"],
  },
  { command: "ls ./writing", output: ["deep-dives/  postmortems/  notes/"] },
];

export default function HomePage() {
  const featuredPosts = getFeaturedPosts(4).map(toSummary);
  const featuredProjects = getFeaturedProjects(2);
  const cats = getCategoriesWithCounts();

  return (
    <>
      <Container className="grid items-center gap-12 pt-16 pb-10 sm:pt-24 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-border bg-surface/60 px-3 py-1 font-mono text-xs text-muted">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full rounded-full bg-accent opacity-60 motion-safe:animate-ping" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            engineering log · {site.role.toLowerCase()}
          </p>
          <h1 className="mt-6 text-display font-semibold text-fg">
            Notes from the{" "}
            <span className="bg-gradient-to-r from-accent-text to-fg bg-clip-text text-transparent">
              pipeline
            </span>
            .
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            Deep-dives on the systems behind my projects: how they are built, deployed and kept
            alive. The polished showcase lives on the portfolio; the engineering story lives here.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/blog" className={buttonVariants({ size: "md" })}>
              Read the blog <ArrowRight />
            </Link>
            <a
              href={site.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonVariants({ variant: "secondary" })}
            >
              Portfolio <ArrowUpRight />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>
        <Terminal lines={intro} title="david@devlog: ~" />
      </Container>

      <Section
        eyebrow="latest"
        title="Featured writing"
        action={
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
          >
            All posts <ArrowRight />
          </Link>
        }
      >
        <ul className="grid gap-4 sm:grid-cols-2">
          {featuredPosts.map((post, i) => (
            <Reveal as="li" key={post.slug} delay={i * 0.06}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section
        eyebrow="projects"
        title="What I build"
        description="Short cards here; full case studies on the portfolio."
        action={
          <Link
            href="/projects"
            className="inline-flex items-center gap-1 text-sm text-muted hover:text-fg"
          >
            All projects <ArrowRight />
          </Link>
        }
      >
        <ul className="grid gap-4 md:grid-cols-2">
          {featuredProjects.map((project, i) => (
            <Reveal as="li" key={project.slug} delay={i * 0.06}>
              <ProjectCard
                project={project}
                posts={getPostsByProject(project.slug).map(toSummary)}
              />
            </Reveal>
          ))}
        </ul>
      </Section>

      <Section eyebrow="topics" title="Categories">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cats.map((c, i) => (
            <Reveal as="li" key={c.slug} delay={i * 0.05}>
              <Card interactive className="h-full">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold text-fg">
                    <Link
                      href={`/categories/${c.slug}` as Route}
                      className="outline-none after:absolute after:inset-0 after:rounded-xl"
                    >
                      {c.title}
                    </Link>
                  </h3>
                  <span className="font-mono text-xs text-subtle">
                    {c.count} {c.count === 1 ? "post" : "posts"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted">{c.description}</p>
              </Card>
            </Reveal>
          ))}
        </ul>
      </Section>
    </>
  );
}
