"use client";

import { useEffect, useState } from "react";
import { getBrowserApi } from "@/lib/api-browser";

const format = (n: number, locale: string) => new Intl.NumberFormat(locale).format(n);

/**
 * Records a view and shows the unique-view count. Renders nothing until the API answers,
 * and nothing at all if it is unreachable: the page must never show an error for this.
 */
export function ViewCounter({ slug, rtl = false }: { slug: string; rtl?: boolean }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    getBrowserApi()
      .views.record(slug)
      .then((res) => {
        if (active) setCount(res.count);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [slug]);

  if (count === null) return null;
  const n = format(count, rtl ? "he-IL" : "en-US");
  return (
    <>
      <span aria-hidden>·</span>
      <span>{rtl ? `${n} צפיות` : `${n} ${count === 1 ? "view" : "views"}`}</span>
    </>
  );
}
