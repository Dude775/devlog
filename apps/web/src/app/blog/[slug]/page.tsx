import { type Metadata, type Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@/components/blog/reading-progress";
import { TableOfContents } from "@/components/blog/table-of-contents";
import { MdxContent } from "@/components/mdx/mdx-content";
import { ProjectCard } from "@/components/projects/project-card";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/ui/container";
import { ArrowLeft, ArrowRight, ClockIcon } from "@/components/ui/icons";
import { Prose } from "@/components/ui/prose";
import { Tag } from "@/components/ui/tag";
import { categories } from "@/config/categories";
import { type Post } from "#site/content";
import {
  formatDate,
  getAdjacentPosts,
  getPost,
  getPosts,
  getPostsByProject,
  getProject,
  toSummary,
} from "@/lib/content";
import { cn } from "@/lib/cn";

interface Props {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: post.permalink },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      publishedTime: post.date,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();

  const rtl = post.dir === "rtl";
  const t = rtl ? he : en;
  const project = post.project ? getProject(post.project) : undefined;
  const { newer, older } = getAdjacentPosts(post.slug);

  return (
    <>
      <ReadingProgress />
      <Container size="wide" className="py-12 sm:py-16">
        <div
          dir={post.dir}
          lang={rtl ? "he" : "en"}
          className={cn(
            "grid gap-12 lg:grid-cols-[minmax(0,1fr)_15rem] xl:gap-16",
            rtl && "font-hebrew",
          )}
        >
          <article className="min-w-0">
            <header className="mx-auto max-w-3xl">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 font-mono text-xs text-subtle hover:text-fg"
              >
                {rtl ? <ArrowRight /> : <ArrowLeft />} {t.back}
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-subtle">
                <Link href={`/categories/${post.category}` as Route}>
                  <Badge variant="accent" className="hover:border-accent/60">
                    {categories[post.category].title}
                  </Badge>
                </Link>
                <time dateTime={post.date}>{formatDate(post.date, rtl ? "he-IL" : "en-US")}</time>
                <span aria-hidden>·</span>
                <span className="inline-flex items-center gap-1">
                  <ClockIcon width={13} height={13} /> {t.minutes(post.metadata.readingTime)}
                </span>
              </div>
              <h1 className="mt-4 text-title font-semibold text-fg">{post.title}</h1>
              <p className="mt-4 text-lg text-muted">{post.description}</p>
              {post.tags.length > 0 && (
                <ul className="mt-6 flex flex-wrap gap-1.5" aria-label={t.tags}>
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Tag tag={tag} href={`/blog?tag=${encodeURIComponent(tag)}` as Route} />
                    </li>
                  ))}
                </ul>
              )}
            </header>

            {post.toc.length > 0 && (
              <details className="mx-auto mt-8 max-w-3xl rounded-xl border border-border bg-surface/60 px-4 py-3 lg:hidden">
                <summary className="cursor-pointer font-mono text-xs tracking-widest text-subtle uppercase">
                  {t.toc}
                </summary>
                <div className="mt-3">
                  <TableOfContents items={post.toc} label={t.toc} />
                </div>
              </details>
            )}

            <Prose className="mx-auto mt-10 max-w-3xl border-t border-border pt-10">
              <MdxContent code={post.body} />
            </Prose>

            {project && (
              <div className="mx-auto mt-14 max-w-3xl" dir="ltr" lang="en">
                <ProjectCard
                  project={project}
                  label="Related project"
                  headingLevel="h2"
                  posts={getPostsByProject(project.slug)
                    .filter((p) => p.slug !== post.slug)
                    .map(toSummary)}
                />
              </div>
            )}

            <PrevNext newer={newer} older={older} rtl={rtl} />
          </article>

          {post.toc.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <TableOfContents items={post.toc} label={t.toc} />
              </div>
            </aside>
          )}
        </div>
      </Container>
    </>
  );
}

function PrevNext({
  newer,
  older,
  rtl,
}: {
  newer: Post | undefined;
  older: Post | undefined;
  rtl: boolean;
}) {
  if (!newer && !older) return null;
  const t = rtl ? he : en;
  const item = (post: Post, label: string, align: "start" | "end") => (
    <Link
      href={post.permalink as Route}
      dir={post.dir}
      className={cn(
        "group block rounded-xl border border-border bg-surface/60 p-4 transition-colors hover:border-border-strong",
        align === "end" && "text-end",
      )}
    >
      <span className="font-mono text-xs text-subtle">{label}</span>
      <span
        className={cn(
          "mt-1 block font-medium text-fg group-hover:text-accent-text",
          post.dir === "rtl" && "font-hebrew",
        )}
      >
        {post.title}
      </span>
    </Link>
  );
  return (
    <nav aria-label={t.more} className="mx-auto mt-14 grid max-w-3xl gap-3 sm:grid-cols-2">
      <div>{older && item(older, t.older, "start")}</div>
      <div>{newer && item(newer, t.newer, "end")}</div>
    </nav>
  );
}

const en = {
  back: "All posts",
  toc: "On this page",
  tags: "Tags",
  more: "More posts",
  older: "Previous",
  newer: "Next",
  minutes: (n: number) => `${n} min read`,
};
const he: typeof en = {
  back: "כל הפוסטים",
  toc: "בעמוד זה",
  tags: "תגיות",
  more: "פוסטים נוספים",
  older: "הקודם",
  newer: "הבא",
  minutes: (n: number) => `${n} דק׳ קריאה`,
};
