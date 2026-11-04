import { type Post, type Project, posts as allPosts, projects as allProjects } from "#site/content";
import { type CategorySlug, categories, categorySlugs } from "@/config/categories";
import { site } from "@/config/site";

/** Serializable post shape for client components (no MDX body). */
export interface PostSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  category: CategorySlug;
  tags: string[];
  dir: "ltr" | "rtl";
  readingTime: number;
  permalink: string;
  project: string | null;
}

const published: Post[] = allPosts
  .filter((p) => process.env.NODE_ENV !== "production" || !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

const sortedProjects: Project[] = [...allProjects].sort(
  (a, b) => a.order - b.order || a.name.localeCompare(b.name),
);

// Fail the build on dangling `project:` references instead of rendering a broken card.
for (const post of published) {
  if (post.project && !sortedProjects.some((p) => p.slug === post.project)) {
    throw new Error(`Post "${post.slug}" references unknown project "${post.project}"`);
  }
}

export function toSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    description: post.description,
    date: post.date,
    category: post.category,
    tags: post.tags,
    dir: post.dir,
    readingTime: post.metadata.readingTime,
    permalink: post.permalink,
    project: post.project ?? null,
  };
}

export function getPosts(): Post[] {
  return published;
}

export function getFeaturedPosts(limit = 3): Post[] {
  const featured = published.filter((p) => p.featured);
  const rest = published.filter((p) => !p.featured);
  return [...featured, ...rest].slice(0, limit);
}

export function getPost(slug: string): Post | undefined {
  return published.find((p) => p.slug === slug);
}

/** Newer and older neighbours in date order. */
export function getAdjacentPosts(slug: string): {
  newer: Post | undefined;
  older: Post | undefined;
} {
  const index = published.findIndex((p) => p.slug === slug);
  return { newer: published[index - 1], older: published[index + 1] };
}

export function getPostsByCategory(category: CategorySlug): Post[] {
  return published.filter((p) => p.category === category);
}

export function getPostsByProject(projectSlug: string): Post[] {
  return published.filter((p) => p.project === projectSlug);
}

export function getAllTags(): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const post of published)
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  return [...counts]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

export function getCategoriesWithCounts() {
  return categorySlugs.map((slug) => ({
    slug,
    ...categories[slug],
    count: published.filter((p) => p.category === slug).length,
  }));
}

export function getProjects(): Project[] {
  return sortedProjects;
}

export function getFeaturedProjects(limit = 3): Project[] {
  return sortedProjects.filter((p) => p.featured).slice(0, limit);
}

export function getProject(slug: string): Project | undefined {
  return sortedProjects.find((p) => p.slug === slug);
}

export function portfolioUrlFor(project: Project): string {
  return project.portfolio ?? site.portfolioUrl;
}

export function formatDate(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
