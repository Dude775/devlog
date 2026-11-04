import { ImageResponse } from "next/og";
import { categories } from "@/config/categories";
import { formatDate, getPost, getPosts } from "@/lib/content";
import { OgFrame, loadOgFonts, ogSize } from "@/lib/og";

export const dynamicParams = false;
export const alt = "Post cover";
export const size = ogSize;
export const contentType = "image/png";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) return new Response("Not found", { status: 404 });
  return new ImageResponse(
    <OgFrame
      cwd="~/blog"
      eyebrow={categories[post.category].title.toLowerCase()}
      title={post.title}
      rtl={post.dir === "rtl"}
      tags={post.tags}
      meta={`${formatDate(post.date)} · ${String(post.metadata.readingTime)} min read`}
    />,
    { ...ogSize, fonts: await loadOgFonts() },
  );
}
