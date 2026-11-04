import { serializeJsonLd } from "@/lib/seo";

/** Inline structured data. Server component; content is our own data, `<` is escaped. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
