import { ImageResponse } from "next/og";
import { site } from "@/config/site";
import { OgFrame, loadOgFonts, ogSize } from "@/lib/og";

export const dynamic = "force-static";
export const alt = `${site.name}, ${site.role}`;
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgFrame
      cwd="~"
      eyebrow="engineering log"
      title="Notes from the pipeline."
      tags={["devops", "aws", "kubernetes", "ci-cd", "terraform"]}
      meta={site.portfolioUrl.replace(/^https?:\/\//, "")}
    />,
    { ...ogSize, fonts: await loadOgFonts() },
  );
}
