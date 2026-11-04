import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "accent" | "outline";
}

const variants = {
  default: "bg-surface-2 text-muted border-border",
  accent: "bg-accent-soft text-accent-text border-accent/25",
  outline: "bg-transparent text-muted border-border-strong",
} as const;

/** Non-interactive label, e.g. stack items or categories. Monospace by design. */
export function Badge({ variant = "default", className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 font-mono text-[0.72rem] leading-5 tracking-tight",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
