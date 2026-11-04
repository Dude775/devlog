import { defineCollection, defineConfig, s } from "velite";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s
    .object({
      title: s.string().max(120),
      slug: s.slug("posts"),
      date: s.isodate(),
      description: s.string().max(300),
      tags: s.array(s.string()).default([]),
      draft: s.boolean().default(false),
      metadata: s.metadata(),
      body: s.mdx(),
    })
    .transform((data) => ({ ...data, permalink: `/blog/${data.slug}` })),
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
  collections: { posts },
});
