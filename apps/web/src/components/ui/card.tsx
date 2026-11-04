import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Adds hover affordances; pair with a stretched link inside (`after:absolute after:inset-0`). */
  interactive?: boolean;
}

export function Card({ interactive = false, className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border bg-surface/70 p-5 backdrop-blur-[2px]",
        interactive &&
          "group transition-[border-color,transform,background-color] duration-200 hover:border-border-strong hover:bg-surface motion-safe:hover:-translate-y-0.5 has-[a:focus-visible]:border-accent",
        className,
      )}
      {...props}
    />
  );
}
