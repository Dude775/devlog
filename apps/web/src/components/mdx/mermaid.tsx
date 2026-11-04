"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

/** Reads design tokens so diagrams follow the active theme (no hard-coded palette). */
function tokenVariables(): Record<string, string> {
  const css = getComputedStyle(document.documentElement);
  const v = (name: string) => css.getPropertyValue(name).trim();
  return {
    background: v("--bg"),
    primaryColor: v("--surface-2"),
    primaryTextColor: v("--fg"),
    primaryBorderColor: v("--accent"),
    secondaryColor: v("--surface"),
    tertiaryColor: v("--surface"),
    lineColor: v("--muted"),
    textColor: v("--fg"),
    clusterBkg: v("--surface"),
    clusterBorder: v("--muted"),
    edgeLabelBackground: v("--surface"),
    fontFamily: css.getPropertyValue("--font-jetbrains").trim() || "monospace",
  };
}

/**
 * Renders a Mermaid diagram on the client. Mermaid is loaded on demand (only on posts
 * that contain a diagram). SSR, no-JS and render errors show the diagram source instead.
 */
export function Mermaid({ chart }: { chart: string }) {
  const id = `mmd-${useId().replace(/[^a-zA-Z0-9-]/g, "")}`;
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);

  useEffect(() => {
    const run = { cancelled: false };
    void (async () => {
      try {
        const { default: mermaid } = await import("mermaid");
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: "strict",
          theme: "base",
          themeVariables: tokenVariables(),
          flowchart: { curve: "basis" },
        });
        const { svg: out } = await mermaid.render(`${id}-${resolvedTheme ?? "dark"}`, chart);
        if (!run.cancelled) setSvg(out);
      } catch {
        if (!run.cancelled) setSvg(null);
      }
    })();
    return () => {
      run.cancelled = true;
    };
  }, [chart, id, resolvedTheme]);

  return (
    <figure dir="ltr" className="overflow-x-auto rounded-xl border border-border bg-surface/60 p-4">
      {svg ? (
        <div
          role="img"
          aria-label="Diagram"
          className="flex justify-center [&_svg]:h-auto [&_svg]:max-w-full"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : (
        <pre className="font-mono text-xs leading-relaxed whitespace-pre text-muted">{chart}</pre>
      )}
    </figure>
  );
}
