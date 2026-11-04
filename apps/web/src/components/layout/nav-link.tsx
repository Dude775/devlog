"use client";

import { type Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function NavLink({
  href,
  children,
  className,
  onClick,
}: {
  href: Route;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      {...(onClick ? { onClick } : {})}
      aria-current={active ? "page" : undefined}
      className={cn(
        "rounded-md px-3 py-1.5 text-sm transition-colors",
        active ? "text-fg" : "text-muted hover:text-fg",
        className,
      )}
    >
      {children}
    </Link>
  );
}
