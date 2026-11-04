"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/cn";

export interface TocItem {
  title: string;
  url: string;
  items: TocItem[];
}

function flatten(items: TocItem[], depth = 0): { title: string; id: string; depth: number }[] {
  return items.flatMap((i) => [
    { title: i.title, id: decodeURIComponent(i.url.replace(/^#/, "")), depth },
    ...flatten(i.items, depth + 1),
  ]);
}

/** Auto ToC from velite's `s.toc()`; highlights the heading currently in view. */
export function TableOfContents({
  items,
  label = "On this page",
}: {
  items: TocItem[];
  label?: string;
}) {
  const flat = useMemo(() => flatten(items), [items]);
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const els = flat
      .map((f) => document.getElementById(f.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const first = visible[0];
        if (first) setActive(first.target.id);
      },
      { rootMargin: "-80px 0px -65% 0px", threshold: [0, 1] },
    );
    for (const el of els) observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [flat]);

  if (flat.length === 0) return null;

  return (
    <nav aria-label={label} className="text-sm">
      <p className="font-mono text-xs tracking-widest text-subtle uppercase">{label}</p>
      <ul className="mt-3 space-y-1 border-s border-border">
        {flat.map((f) => (
          <li key={f.id}>
            <a
              href={`#${f.id}`}
              aria-current={active === f.id ? "location" : undefined}
              className={cn(
                "-ms-px block border-s py-1 leading-snug transition-colors",
                f.depth === 0 ? "ps-3" : "ps-6",
                active === f.id
                  ? "border-accent text-fg"
                  : "border-transparent text-subtle hover:border-border-strong hover:text-muted",
              )}
            >
              {f.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
