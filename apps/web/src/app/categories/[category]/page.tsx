import { type Metadata } from "next";
import { pageMetadata } from "@/lib/seo";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/blog/post-card";
import { PageHeader } from "@/components/layout/page-header";
import { Reveal } from "@/components/motion/reveal";
import { Container } from "@/components/ui/container";
import { ArrowLeft } from "@/components/ui/icons";
import { categories, categorySlugs, isCategorySlug } from "@/config/categories";
import { getPostsByCategory, toSummary } from "@/lib/content";

interface Props {
  params: Promise<{ category: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return categorySlugs.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isCategorySlug(category)) return {};
  return pageMetadata({
    title: categories[category].title,
    description: categories[category].description,
    path: `/categories/${category}`,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isCategorySlug(category)) notFound();
  const meta = categories[category];
  const posts = getPostsByCategory(category).map(toSummary);

  return (
    <Container className="py-14 sm:py-20">
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 font-mono text-xs text-subtle hover:text-fg"
      >
        <ArrowLeft /> All posts
      </Link>
      <div className="mt-6">
        <PageHeader eyebrow="category" title={meta.title} description={meta.description} />
      </div>
      {posts.length === 0 ? (
        <p className="mt-12 rounded-xl border border-dashed border-border px-4 py-12 text-center text-muted">
          No posts here yet. Soon.
        </p>
      ) : (
        <ul className="mt-12 grid gap-4 sm:grid-cols-2">
          {posts.map((post, i) => (
            <Reveal as="li" key={post.slug} delay={i * 0.05}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </ul>
      )}
    </Container>
  );
}
