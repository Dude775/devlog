import Link from "next/link";
import { mainNav, site } from "@/config/site";
import { Container } from "@/components/ui/container";
import { ArrowUpRight } from "@/components/ui/icons";
import { MobileNav } from "./mobile-nav";
import { NavLink } from "./nav-link";
import { SearchButton } from "./search-button";
import { ThemeToggle } from "./theme-toggle";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-glass backdrop-blur-xl backdrop-saturate-150">
      <Container className="relative flex h-14 items-center gap-4">
        <Link
          href="/"
          className="group flex items-center gap-2 font-mono text-sm text-fg"
          aria-label={`${site.title} home`}
        >
          <span aria-hidden className="text-accent-text">
            ~/
          </span>
          <span>{site.title}</span>
          <span aria-hidden className="h-4 w-[7px] bg-accent motion-safe:animate-blink" />
        </Link>

        <nav aria-label="Main" className="ms-4 hidden md:block">
          <ul className="flex items-center gap-1">
            {mainNav.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href}>{item.label}</NavLink>
              </li>
            ))}
            <li>
              <a
                href={site.portfolioUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 rounded-md px-3 py-1.5 text-sm text-muted transition-colors hover:text-fg"
              >
                Portfolio
                <ArrowUpRight width={14} height={14} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
            </li>
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1.5">
          <SearchButton />
          <ThemeToggle />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
