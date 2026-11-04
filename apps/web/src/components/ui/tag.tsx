import { type Route } from "next";
import Link from "next/link";
import { cn } from "@/lib/cn";

export interface TagProps {
  tag: string;
  /** When provided the tag is a link; otherwise it renders as a toggle button or plain text. */
  href?: Route;
  active?: boolean;
  onClick?: () => void;
  count?: number;
  className?: string;
}

const styles =
  "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-xs transition-colors duration-150";

/** Hash-prefixed topic chip. Link, toggle button or static span depending on props. */
export function Tag({ tag, href, active = false, onClick, count, className }: TagProps) {
  const cls = cn(
    styles,
    active
      ? "border-accent/50 bg-accent-soft text-accent-text"
      : "border-border text-muted hover:border-border-strong hover:text-fg",
    className,
  );
  const content = (
    <>
      <span aria-hidden className="text-subtle">
        #
      </span>
      {tag}
      {count !== undefined && <span className="text-subtle">{count}</span>}
    </>
  );
  if (href) {
    return (
      <Link href={href} dir="ltr" className={cls}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" dir="ltr" onClick={onClick} aria-pressed={active} className={cls}>
        {content}
      </button>
    );
  }
  return (
    <span dir="ltr" className={cls}>
      {content}
    </span>
  );
}
