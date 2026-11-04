import { type Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import { Suspense } from "react";
import { BlogExplorer } from "@/components/blog/blog-explorer";
import { PostCard } from "@/components/blog/post-card";
import { Container } from "@/components/ui/container";
import { PageHeader } from "@/components/layout/page-header";
import { type CategorySlug, categorySlugs } from "@/config/categories";
import { getAllTags, getPosts, getPostsByCategory, toSummary } from "@/lib/content";

export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description:
    "Engineering deep-dives on DevOps, AWS, Kubernetes, CI/CD, Terraform, observability and OSINT research.",
  path: "/blog",
});

export default function BlogPage() {
  const posts = getPosts().map(toSummary);
  const categoryCounts = Object.fromEntries(
    categorySlugs.map((c) => [c, getPostsByCategory(c).length]),
  ) as Record<CategorySlug, number>;

  return (
    <Container className="py-14 sm:py-20">
      <PageHeader
        eyebrow="blog"
        title="Writing"
        description="Deep-dives on the projects in my portfolio, plus notes from the trenches."
      />
      <div className="mt-10">
        {/* useSearchParams needs a Suspense boundary for static rendering; fallback is the unfiltered list. */}
        <Suspense
          fallback={
            <ul className="grid gap-4 sm:grid-cols-2">
              {posts.map((p) => (
                <li key={p.slug}>
                  <PostCard post={p} />
                </li>
              ))}
            </ul>
          }
        >
          <BlogExplorer posts={posts} tags={getAllTags()} categoryCounts={categoryCounts} />
        </Suspense>
      </div>
    </Container>
  );
}
