import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";
import { categorySlugs } from "./src/config/categories";
import rehypeCodeMeta from "./src/lib/mdx/rehype-code-meta";
import rehypeMermaidBlock from "./src/lib/mdx/rehype-mermaid-block";

const prettyCode: PrettyCodeOptions = {
  theme: { dark: "github-dark-dimmed", light: "github-light" },
  keepBackground: false,
  defaultLang: { block: "plaintext", inline: "plaintext" },
};

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug("posts"),
      date: s.isodate(),
      /** Last meaningful revision. Feeds `dateModified`, sitemap `lastModified` and RSS. */
      updated: s.isodate().optional(),
      category: s.enum(categorySlugs),
      tags: s.array(s.string()).default([]),
      /** One or two sentences. Used for cards, meta description, OG and RSS. */
      summary: s.string().max(300),
      /** Optional cover image, path relative to the MDX file. */
      cover: s.image().optional(),
      /** Text direction. "rtl" renders the post right-to-left with the Hebrew font. */
      dir: s.enum(["ltr", "rtl"]).default("ltr"),
      /** Drafts are rendered in `next dev` only; production builds drop them everywhere. */
      draft: s.boolean().default(false),
      featured: s.boolean().default(false),
      /** Slug of an entry in content/projects. Unknown slugs fail the build (see `prepare`). */
      project: s.string().optional(),
      metadata: s.metadata(),
      toc: s.toc(),
      body: s.mdx(),
    })
    .transform((data) => ({ ...data, permalink: `/blog/${data.slug}` })),
});

const projects = defineCollection({
  name: "Project",
  pattern: "projects/*.yml",
  schema: s.object({
    title: s.string().max(60),
    slug: s.slug("projects"),
    summary: s.string().max(200),
    stack: s.array(s.string()).default([]),
    repo: s.string().url(),
    /** Canonical case study on the portfolio (the portfolio owns project detail). */
    portfolio_url: s.string().url(),
    /** Public deployment, when one exists. */
    live: s.string().url().optional(),
    status: s.enum(["active", "maintained", "archived"]),
    featured: s.boolean().default(false),
  }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:6].[ext]",
    clean: true,
  },
  collections: { posts, projects },
  /** Referential integrity: every `project:` on a post (drafts included) must exist. */
  prepare({ posts, projects }) {
    const known = new Set(projects.map((p) => p.slug));
    const dangling = posts.filter((p) => p.project !== undefined && !known.has(p.project));
    if (dangling.length > 0) {
      const list = dangling.map((p) => `  - ${p.slug} -> "${p.project ?? ""}"`).join("\n");
      throw new Error(
        `Unknown project slug in post frontmatter:\n${list}\nKnown: ${[...known].join(", ")}`,
      );
    }
  },
  mdx: {
    rehypePlugins: [rehypeSlug, rehypeMermaidBlock, [rehypePrettyCode, prettyCode], rehypeCodeMeta],
  },
});
