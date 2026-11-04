"use client";

import { type HTMLAttributes, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  "data-language"?: string;
  "data-title"?: string;
}

/**
 * Wraps a shiki-highlighted `<pre>` (rendered at build time by rehype-pretty-code)
 * with a filename/language header and an accessible copy button.
 */
export function CodeBlock({
  "data-language": language,
  "data-title": title,
  className,
  children,
  ...props
}: CodeBlockProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => {
      setCopied(false);
    }, 1800);
    return () => {
      clearTimeout(t);
    };
  }, [copied]);

  async function copy() {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text.replace(/\n$/, ""));
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  const label = title ?? language;

  return (
    <div
      className="code-block group/code relative overflow-hidden rounded-xl border border-border bg-surface"
      dir="ltr"
    >
      <div className="flex h-10 items-center justify-between gap-3 border-b border-border bg-surface-2/60 ps-4 pe-1.5">
        <div className="flex min-w-0 items-center gap-2 font-mono text-xs text-subtle">
          <span aria-hidden className="flex gap-1.5">
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
            <span className="size-2.5 rounded-full bg-border-strong" />
          </span>
          {label && <span className="truncate text-muted">{label}</span>}
        </div>
        <button
          type="button"
          onClick={() => void copy()}
          className="inline-flex h-7 items-center gap-1.5 rounded-md px-2 font-mono text-xs text-subtle transition-colors hover:bg-surface hover:text-fg"
          aria-label={copied ? "Copied to clipboard" : "Copy code to clipboard"}
        >
          {copied ? <CheckIcon /> : <CopyIcon />}
          <span aria-hidden>{copied ? "copied" : "copy"}</span>
        </button>
        <span role="status" aria-live="polite" className="sr-only">
          {copied ? "Code copied" : ""}
        </span>
      </div>
      <pre ref={preRef} className={cn(className)} {...props}>
        {children}
      </pre>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      aria-hidden
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
    >
      <path d="m5 12 5 5L20 7" />
    </svg>
  );
}
