import rehypePrettyCode, { type Options as PrettyCodeOptions } from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";
import { categorySlugs } from "./src/config/categories";
import rehypeCodeMeta from "./src/lib/mdx/rehype-code-meta";

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
      description: s.string().max(300),
      category: s.enum(categorySlugs),
      tags: s.array(s.string()).default([]),
      /** Slug of an entry in content/projects. Renders a "Related project" card. */
      project: s.string().optional(),
      /** Text direction. "rtl" renders the post right-to-left with the Hebrew font. */
      dir: s.enum(["ltr", "rtl"]).default("ltr"),
      featured: s.boolean().default(false),
      draft: s.boolean().default(false),
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
    name: s.string().max(60),
    slug: s.slug("projects"),
    summary: s.string().max(160),
    stack: s.array(s.string()).default([]),
    repo: s.string().url(),
    /** Case-study URL on the canonical portfolio. Falls back to the portfolio root. */
    portfolio: s.string().url().optional(),
    featured: s.boolean().default(false),
    order: s.number().default(100),
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
  mdx: {
    rehypePlugins: [rehypeSlug, [rehypePrettyCode, prettyCode], rehypeCodeMeta],
  },
});
