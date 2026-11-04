import { type Route } from "next";
import Link from "next/link";
import { categories } from "@/config/categories";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ArrowRight } from "@/components/ui/icons";
import { type PostSummary, formatDate } from "@/lib/content";
import { cn } from "@/lib/cn";

/** Post teaser. The title link is stretched over the card; tags stay text to avoid nested links. */
export function PostCard({ post, className }: { post: PostSummary; className?: string }) {
  const rtl = post.dir === "rtl";
  return (
    <Card interactive className={cn("flex h-full flex-col", className)}>
      <div className="flex items-center gap-2 font-mono text-xs text-subtle">
        <Badge variant="accent">{categories[post.category].title}</Badge>
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime} min</span>
      </div>
      <h3
        dir={post.dir}
        lang={rtl ? "he" : undefined}
        className={cn(
          "mt-4 text-lg leading-snug font-semibold tracking-tight text-fg",
          rtl && "font-hebrew",
        )}
      >
        <Link
          href={post.permalink as Route}
          className="outline-none after:absolute after:inset-0 after:rounded-xl"
        >
          {post.title}
        </Link>
      </h3>
      <p
        dir={post.dir}
        lang={rtl ? "he" : undefined}
        className={cn("mt-2 line-clamp-3 text-sm text-muted", rtl && "font-hebrew")}
      >
        {post.summary}
      </p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-5">
        <ul
          className="flex flex-wrap gap-x-2 gap-y-1 font-mono text-xs text-subtle"
          aria-label="Tags"
        >
          {post.tags.slice(0, 3).map((t) => (
            <li key={t}>#{t}</li>
          ))}
        </ul>
        <ArrowRight className="shrink-0 text-subtle transition-transform group-hover:translate-x-0.5 group-hover:text-accent-text" />
      </div>
    </Card>
  );
}
