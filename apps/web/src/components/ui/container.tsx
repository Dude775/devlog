import { type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const sizes = { prose: "max-w-3xl", default: "max-w-6xl", wide: "max-w-7xl" } as const;

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  size?: keyof typeof sizes | undefined;
}

export function Container({ size = "default", className, ...props }: ContainerProps) {
  return <div className={cn("mx-auto w-full px-4 sm:px-6", sizes[size], className)} {...props} />;
}
