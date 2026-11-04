"use client";

import { AnimatePresence, m } from "framer-motion";
import { type Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { type CategorySlug, categories } from "@/config/categories";
import { Tag } from "@/components/ui/tag";
import { type PostSummary } from "@/lib/content";
import { cn } from "@/lib/cn";
import { PostCard } from "./post-card";

export interface BlogExplorerProps {
  posts: PostSummary[];
  tags: { tag: string; count: number }[];
  categoryCounts: Record<CategorySlug, number>;
}

/** Client-side category + tag filtering, mirrored to the URL (`?category=x&tag=a&tag=b`). */
export function BlogExplorer({ posts, tags, categoryCounts }: BlogExplorerProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const rawCategory = params.get("category");
  const category = rawCategory && rawCategory in categories ? (rawCategory as CategorySlug) : null;
  const selectedTags = useMemo(() => params.getAll("tag"), [params]);

  const filtered = useMemo(
    () =>
      posts.filter(
        (p) =>
          (!category || p.category === category) && selectedTags.every((t) => p.tags.includes(t)),
      ),
    [posts, category, selectedTags],
  );

  function update(next: { category?: CategorySlug | null; tags?: string[] }) {
    const qs = new URLSearchParams();
    const c = next.category === undefined ? category : next.category;
    if (c) qs.set("category", c);
    for (const t of next.tags ?? selectedTags) qs.append("tag", t);
    const query = qs.toString();
    router.replace(`${pathname}${query ? `?${query}` : ""}` as Route, { scroll: false });
  }

  function toggleTag(tag: string) {
    update({
      tags: selectedTags.includes(tag)
        ? selectedTags.filter((t) => t !== tag)
        : [...selectedTags, tag],
    });
  }

  const hasFilters = category !== null || selectedTags.length > 0;

  return (
    <div>
      <div className="space-y-4">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          <CategoryChip
            active={category === null}
            onClick={() => {
              update({ category: null });
            }}
            count={posts.length}
          >
            All
          </CategoryChip>
          {(Object.keys(categories) as CategorySlug[]).map((slug) => (
            <CategoryChip
              key={slug}
              active={category === slug}
              count={categoryCounts[slug]}
              onClick={() => {
                update({ category: category === slug ? null : slug });
              }}
            >
              {categories[slug].title}
            </CategoryChip>
          ))}
        </div>
        {tags.length > 0 && (
          <div
            role="group"
            aria-label="Filter by tag"
            className="flex flex-wrap items-center gap-1.5"
          >
            {tags.map(({ tag, count }) => (
              <Tag
                key={tag}
                tag={tag}
                count={count}
                active={selectedTags.includes(tag)}
                onClick={() => {
                  toggleTag(tag);
                }}
              />
            ))}
            {hasFilters && (
              <button
                type="button"
                onClick={() => {
                  update({ category: null, tags: [] });
                }}
                className="ms-1 font-mono text-xs text-subtle underline-offset-4 hover:text-fg hover:underline"
              >
                clear filters
              </button>
            )}
          </div>
        )}
      </div>

      <p role="status" aria-live="polite" className="mt-8 font-mono text-xs text-subtle">
        {filtered.length} {filtered.length === 1 ? "post" : "posts"}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-12 text-center text-muted">
          Nothing matches those filters yet.
        </p>
      ) : (
        <ul className="mt-4 grid gap-4 sm:grid-cols-2">
          <AnimatePresence initial={false} mode="popLayout">
            {filtered.map((post) => (
              <m.li
                key={post.slug}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.2 }}
              >
                <PostCard post={post} />
              </m.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
    </div>
  );
}

function CategoryChip({
  active,
  onClick,
  count,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  children: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "inline-flex h-8 items-center gap-2 rounded-lg border px-3 text-sm transition-colors",
        active
          ? "border-accent/50 bg-accent-soft text-fg"
          : "border-border bg-surface/60 text-muted hover:border-border-strong hover:text-fg",
      )}
    >
      {children}
      <span className="font-mono text-xs text-subtle">{count}</span>
    </button>
  );
}
