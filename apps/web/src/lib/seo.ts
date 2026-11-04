import { type Metadata } from "next";
import { type Post } from "#site/content";
import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { publicEnv } from "@/env";
import { lastModified } from "@/lib/content";

/** Canonical origin without a trailing slash, e.g. https://devlog.example.com */
export const siteUrl = publicEnv.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  return new URL(path, `${siteUrl}/`).toString();
}

const feed = { "application/rss+xml": [{ url: "/rss.xml", title: `${site.title} RSS` }] };

/** Canonical + feed discovery. Page-level `alternates` replaces the layout's, so always use this. */
export function alternatesFor(path: string): Metadata["alternates"] {
  return { canonical: path, types: feed };
}

interface PageMetaInput {
  title?: string;
  description: string;
  /** Route path, e.g. "/blog". Becomes the canonical URL and og:url. */
  path: string;
  /** Disallow indexing (utility pages such as /status). */
  noindex?: boolean;
}

/**
 * Full per-page metadata. Next merges metadata shallowly, so every page sets its own
 * `openGraph`/`twitter` objects here instead of relying on the root layout's.
 * OG images come from the nearest `opengraph-image.tsx` file convention.
 */
export function pageMetadata({ title, description, path, noindex }: PageMetaInput): Metadata {
  const ogTitle = title ?? `${site.name} | ${site.role}`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: alternatesFor(path),
    openGraph: {
      type: "website",
      siteName: site.title,
      locale: site.locale,
      url: path,
      title: ogTitle,
      description,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

export function postMetadata(post: Post): Metadata {
  const tags = [categories[post.category].title, ...post.tags];
  return {
    title: post.title,
    description: post.summary,
    keywords: tags,
    authors: [{ name: site.name, url: site.portfolioUrl }],
    alternates: alternatesFor(post.permalink),
    openGraph: {
      type: "article",
      siteName: site.title,
      locale: post.dir === "rtl" ? "he_IL" : site.locale,
      url: post.permalink,
      title: post.title,
      description: post.summary,
      publishedTime: post.date,
      modifiedTime: lastModified(post),
      authors: [site.portfolioUrl],
      section: categories[post.category].title,
      tags: post.tags,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.summary },
  };
}

/* ---------- JSON-LD ---------- */

const personId = absoluteUrl("/#person");
const websiteId = absoluteUrl("/#website");

export function personJsonLd() {
  return {
    "@type": "Person",
    "@id": personId,
    name: site.name,
    jobTitle: site.jobTitle,
    url: absoluteUrl("/about"),
    email: `mailto:${site.social.email}`,
    sameAs: site.sameAs,
  };
}

/** Site-wide graph: the WebSite and its author. Rendered once in the root layout. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": websiteId,
        url: absoluteUrl("/"),
        name: site.title,
        description: site.description,
        inLanguage: "en",
        author: { "@id": personId },
        publisher: { "@id": personId },
      },
      personJsonLd(),
    ],
  };
}

export function blogPostingJsonLd(post: Post) {
  const url = absoluteUrl(post.permalink);
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${url}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    url,
    headline: post.title,
    description: post.summary,
    datePublished: post.date,
    dateModified: lastModified(post),
    inLanguage: post.dir === "rtl" ? "he" : "en",
    articleSection: categories[post.category].title,
    keywords: post.tags.join(", "),
    wordCount: post.metadata.wordCount,
    image: absoluteUrl(`${post.permalink}/opengraph-image`),
    author: { "@id": personId, "@type": "Person", name: site.name, url: absoluteUrl("/about") },
    publisher: { "@id": personId },
    isPartOf: { "@id": websiteId },
  };
}

/** Serializes JSON-LD safely for an inline <script> (no `</script>` breakout). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
