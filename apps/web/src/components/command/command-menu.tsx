"use client";

import { Description as DialogDescription, Title as DialogTitle } from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { type Route } from "next";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { type ReactNode } from "react";
import { site } from "@/config/site";
import {
  ArrowRight,
  ArrowUpRight,
  GitHubIcon,
  MoonIcon,
  SearchIcon,
  SunIcon,
} from "@/components/ui/icons";
import { useCommandMenu } from "./command-menu-context";

export interface CommandIndex {
  posts: {
    title: string;
    permalink: string;
    category: string;
    tags: string[];
    dir: "ltr" | "rtl";
  }[];
  projects: { name: string; slug: string; repo: string; summary: string }[];
  categories: { slug: string; title: string }[];
}

const pages: { label: string; href: Route }[] = [
  { label: "Home", href: "/" },
  { label: "Blog", href: "/blog" },
  { label: "Projects", href: "/projects" },
  { label: "About", href: "/about" },
];

const itemClass =
  "flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-muted outline-none select-none data-[selected=true]:bg-surface-2 data-[selected=true]:text-fg";
const groupClass =
  "[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-[0.68rem] [&_[cmdk-group-heading]]:tracking-widest [&_[cmdk-group-heading]]:text-subtle [&_[cmdk-group-heading]]:uppercase";

export function CommandMenu({ index }: { index: CommandIndex }) {
  const { open, setOpen } = useCommandMenu();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();

  function run(action: () => void) {
    setOpen(false);
    action();
  }
  const go = (href: Route) => {
    run(() => {
      router.push(href);
    });
  };
  const external = (url: string) => {
    run(() => {
      window.open(url, "_blank", "noopener,noreferrer");
    });
  };

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label="Command menu"
      loop
      overlayClassName="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      contentClassName="fixed top-[12vh] left-1/2 z-50 w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl shadow-black/40"
    >
      <DialogTitle className="sr-only">Command menu</DialogTitle>
      <DialogDescription className="sr-only">
        Search posts and projects, jump to a page or run an action. Use arrow keys to move and Enter
        to open.
      </DialogDescription>
      <div className="flex items-center gap-3 border-b border-border px-4">
        <SearchIcon className="text-subtle" />
        <Command.Input
          placeholder="Search posts, projects, pages…"
          className="h-14 w-full bg-transparent text-[0.95rem] text-fg outline-none placeholder:text-subtle"
        />
        <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[0.65rem] text-subtle">
          ESC
        </kbd>
      </div>
      <Command.List className="max-h-[min(60vh,420px)] overflow-y-auto overscroll-contain p-2">
        <Command.Empty className="px-3 py-10 text-center text-sm text-subtle">
          No results.
        </Command.Empty>

        {index.posts.length > 0 && (
          <Command.Group heading="Posts" className={groupClass}>
            {index.posts.map((p) => (
              <Command.Item
                key={p.permalink}
                value={`post ${p.title} ${p.category} ${p.tags.join(" ")}`}
                onSelect={() => {
                  go(p.permalink as Route);
                }}
                className={itemClass}
              >
                <Glyph>md</Glyph>
                <span dir={p.dir} className="flex-1 truncate">
                  {p.title}
                </span>
                <span className="font-mono text-[0.68rem] text-subtle">{p.category}</span>
              </Command.Item>
            ))}
          </Command.Group>
        )}

        {index.projects.length > 0 && (
          <Command.Group heading="Projects" className={groupClass}>
            {index.projects.map((p) => (
              <Command.Item
                key={p.slug}
                value={`project ${p.name} ${p.summary}`}
                onSelect={() => {
                  go(`/projects#${p.slug}` as Route);
                }}
                className={itemClass}
              >
                <Glyph>pj</Glyph>
                <span className="flex-1 truncate">{p.name}</span>
                <ArrowRight className="text-subtle" />
              </Command.Item>
            ))}
            {index.projects.map((p) => (
              <Command.Item
                key={`${p.slug}-repo`}
                value={`repo github ${p.name}`}
                onSelect={() => {
                  external(p.repo);
                }}
                className={itemClass}
              >
                <GitHubIcon />
                <span className="flex-1 truncate">{p.name} on GitHub</span>
                <ArrowUpRight className="text-subtle" />
              </Command.Item>
            ))}
          </Command.Group>
        )}

        <Command.Group heading="Navigate" className={groupClass}>
          {pages.map((p) => (
            <Command.Item
              key={p.href}
              value={`page ${p.label}`}
              onSelect={() => {
                go(p.href);
              }}
              className={itemClass}
            >
              <Glyph>/</Glyph>
              <span className="flex-1">{p.label}</span>
            </Command.Item>
          ))}
          {index.categories.map((c) => (
            <Command.Item
              key={c.slug}
              value={`category ${c.title}`}
              onSelect={() => {
                go(`/categories/${c.slug}` as Route);
              }}
              className={itemClass}
            >
              <Glyph>#</Glyph>
              <span className="flex-1">Category: {c.title}</span>
            </Command.Item>
          ))}
          <Command.Item
            value="portfolio external"
            onSelect={() => {
              external(site.portfolioUrl);
            }}
            className={itemClass}
          >
            <Glyph>↗</Glyph>
            <span className="flex-1">Portfolio</span>
            <ArrowUpRight className="text-subtle" />
          </Command.Item>
        </Command.Group>

        <Command.Group heading="Actions" className={groupClass}>
          <Command.Item
            value="toggle theme dark light mode"
            onSelect={() => {
              run(() => {
                setTheme(resolvedTheme === "dark" ? "light" : "dark");
              });
            }}
            className={itemClass}
          >
            {resolvedTheme === "dark" ? <SunIcon /> : <MoonIcon />}
            <span className="flex-1">
              Switch to {resolvedTheme === "dark" ? "light" : "dark"} mode
            </span>
          </Command.Item>
        </Command.Group>
      </Command.List>
      <div className="flex items-center justify-between border-t border-border px-4 py-2 font-mono text-[0.68rem] text-subtle">
        <span>↑↓ navigate · ↵ open</span>
        <span>{site.title}</span>
      </div>
    </Command.Dialog>
  );
}

function Glyph({ children }: { children: ReactNode }) {
  return (
    <span
      aria-hidden
      className="grid size-6 shrink-0 place-items-center rounded-md border border-border bg-surface-2 font-mono text-[0.62rem] text-subtle"
    >
      {children}
    </span>
  );
}
