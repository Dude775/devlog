import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

const tones = {
  info: "border-accent/30 bg-accent-soft",
  warn: "border-amber-500/30 bg-amber-500/10",
} as const;

export function Callout({
  title,
  tone = "info",
  children,
}: {
  title?: string;
  tone?: keyof typeof tones;
  children: ReactNode;
}) {
  return (
    <aside className={cn("not-prose my-6 rounded-xl border px-4 py-3 text-[0.95rem]", tones[tone])}>
      {title && (
        <p className="font-mono text-xs tracking-wider text-accent-text uppercase">{title}</p>
      )}
      <div className="mt-1 text-fg/90 [&>p]:m-0">{children}</div>
    </aside>
  );
}
