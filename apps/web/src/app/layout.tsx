import { type Metadata, type Viewport } from "next";
import { Heebo, Inter, JetBrains_Mono } from "next/font/google";
import { type ReactNode } from "react";
import { CommandMenu, type CommandIndex } from "@/components/command/command-menu";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { Providers } from "@/components/providers";
import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { getPosts, getProjects } from "@/lib/content";
import { pageMetadata, siteJsonLd, siteUrl } from "@/lib/seo";
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
  ...pageMetadata({ description: site.description, path: "/" }),
  metadataBase: new URL(siteUrl),
  title: { default: `${site.name} | ${site.role}`, template: `%s | ${site.name}` },
  applicationName: site.title,
  authors: [{ name: site.name, url: site.portfolioUrl }],
  creator: site.name,
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
      name: p.title,
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
          <JsonLd data={siteJsonLd()} />
        </Providers>
      </body>
    </html>
  );
}
