import { type MetadataRoute } from "next";
import { getCategoriesWithCounts, getPosts, lastModified } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

/** Published posts, static pages and non-empty categories. Drafts never appear in production. */
export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getPosts();
  const latest = posts[0] ? lastModified(posts[0]) : undefined;
  const at = (date: string | undefined) => (date ? { lastModified: date } : {});

  const pages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "weekly", priority: 1, ...at(latest) },
    { url: absoluteUrl("/blog"), changeFrequency: "weekly", priority: 0.9, ...at(latest) },
    { url: absoluteUrl("/projects"), changeFrequency: "monthly", priority: 0.7 },
    { url: absoluteUrl("/about"), changeFrequency: "yearly", priority: 0.5 },
    { url: absoluteUrl("/contact"), changeFrequency: "yearly", priority: 0.3 },
  ];

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: absoluteUrl(post.permalink),
    lastModified: lastModified(post),
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = getCategoriesWithCounts()
    .filter((c) => c.count > 0)
    .map((c) => ({
      url: absoluteUrl(`/categories/${c.slug}`),
      changeFrequency: "weekly",
      priority: 0.5,
    }));

  return [...pages, ...postEntries, ...categoryEntries];
}
