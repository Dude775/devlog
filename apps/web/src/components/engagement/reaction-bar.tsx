"use client";

import { type ReactionCounts, type ReactionType, reactionTypes } from "@devlog/shared/schemas";
import { useEffect, useState } from "react";
import { getBrowserApi } from "@/lib/api-browser";
import { cn } from "@/lib/cn";

const meta: Record<ReactionType, { emoji: string; en: string; he: string }> = {
  fire: { emoji: "🔥", en: "Fire", he: "אש" },
  brain: { emoji: "🧠", en: "Mind-blowing", he: "מעורר מחשבה" },
  rocket: { emoji: "🚀", en: "Ship it", he: "לשגר" },
};

const storageKey = (slug: string) => `devlog:reactions:${slug}`;

function readMine(slug: string): ReactionType[] {
  try {
    const raw: unknown = JSON.parse(localStorage.getItem(storageKey(slug)) ?? "[]");
    return Array.isArray(raw)
      ? raw.filter((t): t is ReactionType => reactionTypes.includes(t as ReactionType))
      : [];
  } catch {
    return [];
  }
}

function writeMine(slug: string, mine: ReactionType[]) {
  try {
    localStorage.setItem(storageKey(slug), JSON.stringify(mine));
  } catch {
    // Storage blocked (private mode): the server still dedupes.
  }
}

/** Reaction buttons with optimistic updates. Hidden entirely when the API is unavailable. */
export function ReactionBar({ slug, rtl = false }: { slug: string; rtl?: boolean }) {
  const [counts, setCounts] = useState<ReactionCounts | null>(null);
  const [mine, setMine] = useState<ReactionType[]>([]);

  useEffect(() => {
    let active = true;
    setMine(readMine(slug));
    getBrowserApi()
      .reactions.get(slug)
      .then((res) => {
        if (active) setCounts(res.counts);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slug]);

  if (!counts) return null;

  function react(type: ReactionType) {
    if (!counts || mine.includes(type)) return;
    const previous = counts;
    const nextMine = [...mine, type];
    setCounts({ ...counts, [type]: counts[type] + 1 });
    setMine(nextMine);
    writeMine(slug, nextMine);
    getBrowserApi()
      .reactions.add(slug, type)
      .then((res) => {
        setCounts(res.counts);
      })
      .catch(() => {
        // Roll back quietly; no error UI for a non-essential feature.
        setCounts(previous);
        setMine(mine);
        writeMine(slug, mine);
      });
  }

  return (
    <div
      role="group"
      aria-label={rtl ? "תגובות לפוסט" : "React to this post"}
      className="flex flex-wrap items-center gap-2"
    >
      {reactionTypes.map((type) => {
        const pressed = mine.includes(type);
        const label = rtl ? meta[type].he : meta[type].en;
        return (
          <button
            key={type}
            type="button"
            onClick={() => {
              react(type);
            }}
            aria-pressed={pressed}
            aria-label={`${label}: ${counts[type]}`}
            title={label}
            className={cn(
              "inline-flex h-9 items-center gap-2 rounded-full border px-3 font-mono text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
              pressed
                ? "border-accent/60 bg-accent-soft text-fg"
                : "border-border bg-surface/60 text-muted hover:border-border-strong hover:text-fg",
            )}
          >
            <span aria-hidden className="text-base leading-none">
              {meta[type].emoji}
            </span>
            <span className="tabular-nums">{counts[type]}</span>
          </button>
        );
      })}
    </div>
  );
}
