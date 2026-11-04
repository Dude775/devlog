import { type Metadata, type Viewport } from "next";
import { Heebo, Inter, JetBrains_Mono } from "next/font/google";
import { type ReactNode } from "react";
import { CommandMenu, type CommandIndex } from "@/components/command/command-menu";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Providers } from "@/components/providers";
import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { publicEnv } from "@/env";
import { getPosts, getProjects } from "@/lib/content";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});
const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  variable: "--font-heebo",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: `${site.name} | ${site.role}`, template: `%s | ${site.name}` },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#08080a" },
    { media: "(prefers-color-scheme: light)", color: "#fafafa" },
  ],
};

function buildCommandIndex(): CommandIndex {
  return {
    posts: getPosts().map((p) => ({
      title: p.title,
      permalink: p.permalink,
      category: p.category,
      tags: p.tags,
      dir: p.dir,
    })),
    projects: getProjects().map((p) => ({
      name: p.name,
      slug: p.slug,
      repo: p.repo,
      summary: p.summary,
    })),
    categories: Object.entries(categories).map(([slug, c]) => ({ slug, title: c.title })),
  };
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${jetbrains.variable} ${heebo.variable} dark`}
    >
      <body className="min-h-dvh font-sans antialiased">
        <Providers>
          <a
            href="#main"
            className="sr-only z-50 rounded-md bg-accent px-3 py-2 text-sm font-medium text-on-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
          >
            Skip to content
          </a>
          <div aria-hidden className="site-backdrop" />
          <SiteHeader />
          <main id="main" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
          <CommandMenu index={buildCommandIndex()} />
        </Providers>
      </body>
    </html>
  );
}
