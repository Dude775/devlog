import { type Post, type Project, posts as allPosts, projects as allProjects } from "#site/content";
import { type CategorySlug, categories, categorySlugs } from "@/config/categories";

/** Serializable post shape for client components (no MDX body). */
export interface PostSummary {
  slug: string;
  title: string;
  summary: string;
  date: string;
  updated: string | null;
  category: CategorySlug;
  tags: string[];
  dir: "ltr" | "rtl";
  readingTime: number;
  permalink: string;
  project: string | null;
}

/** Drafts render in `next dev` only; every production surface (pages, sitemap, RSS, OG) drops them. */
const showDrafts = process.env.NODE_ENV !== "production";

const published: Post[] = allPosts
  .filter((p) => showDrafts || !p.draft)
  .sort((a, b) => b.date.localeCompare(a.date));

// Unknown `project:` slugs already fail `velite build` (velite.config.ts `prepare`).
const sortedProjects: Project[] = [...allProjects].sort(
  (a, b) => Number(b.featured) - Number(a.featured) || a.title.localeCompare(b.title),
);

export function toSummary(post: Post): PostSummary {
  return {
    slug: post.slug,
    title: post.title,
    summary: post.summary,
    date: post.date,
    updated: post.updated ?? null,
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

/** Last-modified date of a post: `updated` when set, else `date`. */
export function lastModified(post: Post): string {
  return post.updated ?? post.date;
}

export function formatDate(iso: string, locale = "en-US"): string {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(iso));
}
