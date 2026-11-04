"use client";

import { usePathname } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { mainNav, site } from "@/config/site";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, CloseIcon, MenuIcon } from "@/components/ui/icons";
import { NavLink } from "./nav-link";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState<string | null>(null);
  const pathname = usePathname();
  const id = useId();

  // Close on route change (adjust state during render instead of an effect).
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (open) setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <Button
        variant="ghost"
        size="icon"
        aria-expanded={open}
        aria-controls={id}
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => {
          setOpen((o) => !o);
        }}
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </Button>
      <nav
        id={id}
        aria-label="Mobile"
        hidden={!open}
        className="absolute inset-x-0 top-full border-b border-border bg-bg/95 px-4 py-3 backdrop-blur-xl"
      >
        <ul className="flex flex-col">
          {mainNav.map((item) => (
            <li key={item.href}>
              <NavLink href={item.href} className="block py-2.5 text-base">
                {item.label}
              </NavLink>
            </li>
          ))}
          <li>
            <a
              href={site.portfolioUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 rounded-md px-3 py-2.5 text-base text-muted hover:text-fg"
            >
              Portfolio <ArrowUpRight />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
}
