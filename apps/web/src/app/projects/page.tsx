import { type Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/projects/project-card";
import { Container } from "@/components/ui/container";
import { ArrowUpRight } from "@/components/ui/icons";
import { site } from "@/config/site";
import { getPostsByProject, getProjects, toSummary } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Projects",
  description: "Projects I write about. Full case studies live on the portfolio.",
  path: "/projects",
});

export default function ProjectsPage() {
  const projects = getProjects();
  return (
    <Container className="py-14 sm:py-20">
      <PageHeader
        eyebrow="projects"
        title="Projects"
        description={
          <>
            The short version, plus the posts that go deep. Screenshots, outcomes and full case
            studies are on the{" "}
            <a
              href={site.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 text-accent-text underline-offset-4 hover:underline"
            >
              portfolio <ArrowUpRight />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
            .
          </>
        }
      />
      <ul className="mt-12 grid gap-4 md:grid-cols-2">
        {projects.map((project, i) => (
          <Reveal as="li" key={project.slug} delay={i * 0.05}>
            <ProjectCard
              project={project}
              headingLevel="h2"
              posts={getPostsByProject(project.slug).map(toSummary)}
            />
          </Reveal>
        ))}
      </ul>
    </Container>
  );
}
