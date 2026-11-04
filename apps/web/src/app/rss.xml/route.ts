import { categories } from "@/config/categories";
import { site } from "@/config/site";
import { getPosts, lastModified } from "@/lib/content";
import { absoluteUrl } from "@/lib/seo";

export const dynamic = "force-static";

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const rfc822 = (iso: string) => new Date(iso).toUTCString();

/** RSS 2.0 feed of published posts (summaries; full text stays on the site). */
export function GET() {
  const posts = getPosts();
  const feedUrl = absoluteUrl("/rss.xml");
  const newest = posts[0] ? lastModified(posts[0]) : undefined;

  const items = posts
    .map((post) => {
      const url = absoluteUrl(post.permalink);
      const cats = [categories[post.category].title, ...post.tags]
        .map((c) => `      <category>${escapeXml(c)}</category>`)
        .join("\n");
      return [
        "    <item>",
        `      <title>${escapeXml(post.title)}</title>`,
        `      <link>${url}</link>`,
        `      <guid isPermaLink="true">${url}</guid>`,
        `      <pubDate>${rfc822(post.date)}</pubDate>`,
        `      <description>${escapeXml(post.summary)}</description>`,
        `      <dc:creator>${escapeXml(site.name)}</dc:creator>`,
        `      <dc:language>${post.dir === "rtl" ? "he" : "en"}</dc:language>`,
        cats,
        "    </item>",
      ].join("\n");
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(`${site.title} | ${site.name}`)}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${escapeXml(site.description)}</description>
    <language>en</language>
    <atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />
${newest ? `    <lastBuildDate>${rfc822(newest)}</lastBuildDate>\n` : ""}${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
