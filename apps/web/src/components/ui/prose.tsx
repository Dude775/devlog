import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/** Typography wrapper for MDX/long-form content. Styles live in globals.css (`.prose`). */
export function Prose({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("prose", className)} {...props} />;
}
