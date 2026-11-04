import { readFile } from "node:fs/promises";
import path from "node:path";
import { site } from "@/config/site";

/**
 * Shared frame for `next/og` images (satori). Satori cannot read CSS variables, so this
 * mirrors the dark theme tokens from `globals.css`. Keep the two in sync.
 */
export const ogTheme = {
  bg: "#08080a",
  surface: "#0f0f12",
  border: "rgba(255,255,255,0.10)",
  grid: "rgba(255,255,255,0.045)",
  fg: "#ededef",
  muted: "#a1a1aa",
  subtle: "#8b8b94",
  accent: "#22d3ee",
  accentSoft: "rgba(34,211,238,0.12)",
} as const;

export const ogSize = { width: 1200, height: 630 } as const;

type FontWeight = 400 | 600 | 700;
interface OgFont {
  name: string;
  data: Buffer;
  weight: FontWeight;
  style: "normal";
}

// Read at build time from @fontsource (woff; satori does not support woff2). No network.
const fontFile = (pkg: string, file: string) =>
  readFile(path.join(process.cwd(), "node_modules", "@fontsource", pkg, "files", file));

let fontsPromise: Promise<OgFont[]> | undefined;
export function loadOgFonts(): Promise<OgFont[]> {
  fontsPromise ??= Promise.all([
    fontFile("inter", "inter-latin-400-normal.woff"),
    fontFile("inter", "inter-latin-700-normal.woff"),
    fontFile("jetbrains-mono", "jetbrains-mono-latin-400-normal.woff"),
    fontFile("jetbrains-mono", "jetbrains-mono-latin-600-normal.woff"),
    fontFile("heebo", "heebo-hebrew-400-normal.woff"),
    fontFile("heebo", "heebo-hebrew-700-normal.woff"),
  ]).then(([i4, i7, m4, m6, h4, h7]) => [
    { name: "Inter", data: i4, weight: 400, style: "normal" },
    { name: "Inter", data: i7, weight: 700, style: "normal" },
    { name: "JetBrains Mono", data: m4, weight: 400, style: "normal" },
    { name: "JetBrains Mono", data: m6, weight: 600, style: "normal" },
    { name: "Heebo", data: h4, weight: 400, style: "normal" },
    { name: "Heebo", data: h7, weight: 700, style: "normal" },
  ]);
  return fontsPromise;
}

const HEBREW = /[֐-׿]/;
const TRAILING_PUNCT = /^(.*?)([:;,.!?]+)$/;

/**
 * Satori has no bidi algorithm: it draws every run left-to-right. For RTL titles we lay
 * out words with `row-reverse` and reverse the glyph order of Hebrew words, so the image
 * reads correctly. Latin words (e.g. "OSINT") keep their order; trailing punctuation moves
 * to the visual left, where RTL places it.
 */
function rtlWords(text: string): string[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      if (HEBREW.test(word)) return Array.from(word).reverse().join("");
      const m = TRAILING_PUNCT.exec(word);
      return m ? `${m[2] ?? ""}${m[1] ?? ""}` : word;
    });
}

function Title({ text, rtl }: { text: string; rtl: boolean }) {
  const size = text.length > 70 ? 54 : text.length > 45 ? 62 : 72;
  const base = {
    fontSize: size,
    lineHeight: 1.12,
    fontWeight: 700,
    color: ogTheme.fg,
    letterSpacing: rtl ? 0 : "-0.025em",
  } as const;
  if (!rtl) return <div style={{ display: "flex", ...base }}>{text}</div>;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row-reverse",
        flexWrap: "wrap",
        columnGap: size * 0.28,
        fontFamily: "Heebo",
        ...base,
      }}
    >
      {rtlWords(text).map((w, i) => (
        <span key={i}>{w}</span>
      ))}
    </div>
  );
}

export interface OgFrameProps {
  /** Terminal prompt path, e.g. "~/blog". */
  cwd: string;
  eyebrow: string;
  title: string;
  rtl?: boolean;
  tags?: string[];
  meta?: string;
}

/** "Terminal meets editorial": window chrome, grid backdrop, cyan accent rail. */
export function OgFrame({ cwd, eyebrow, title, rtl = false, tags = [], meta }: OgFrameProps) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 48,
        backgroundColor: ogTheme.bg,
        backgroundImage: `linear-gradient(${ogTheme.grid} 1px, transparent 1px), linear-gradient(90deg, ${ogTheme.grid} 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
        fontFamily: "Inter",
      }}
    >
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          borderRadius: 20,
          border: `1px solid ${ogTheme.border}`,
          backgroundColor: ogTheme.surface,
          overflow: "hidden",
        }}
      >
        {/* window chrome */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "18px 28px",
            borderBottom: `1px solid ${ogTheme.border}`,
            fontFamily: "JetBrains Mono",
            fontSize: 20,
            color: ogTheme.subtle,
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 14,
                height: 14,
                borderRadius: 7,
                backgroundColor: i === 0 ? ogTheme.accent : ogTheme.border,
              }}
            />
          ))}
          <div style={{ display: "flex", marginLeft: 14 }}>
            {`${site.handle}@${site.title}: ${cwd}`}
          </div>
        </div>

        {/* body */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: rtl ? "flex-end" : "flex-start",
            padding: "0 56px",
            gap: 22,
          }}
        >
          <div
            style={{
              display: "flex",
              fontFamily: "JetBrains Mono",
              fontSize: 24,
              fontWeight: 600,
              color: ogTheme.accent,
            }}
          >
            {`// ${eyebrow}`}
          </div>
          <Title text={title} rtl={rtl} />
          {tags.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 6 }}>
              {tags.slice(0, 5).map((t) => (
                <div
                  key={t}
                  style={{
                    display: "flex",
                    padding: "4px 12px",
                    borderRadius: 8,
                    border: `1px solid ${ogTheme.border}`,
                    backgroundColor: ogTheme.accentSoft,
                    fontFamily: "JetBrains Mono",
                    fontSize: 18,
                    color: ogTheme.muted,
                  }}
                >
                  {`#${t}`}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* footer */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 56px",
            borderTop: `1px solid ${ogTheme.border}`,
            fontSize: 22,
            color: ogTheme.muted,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{ width: 4, height: 28, borderRadius: 2, backgroundColor: ogTheme.accent }}
            />
            <span style={{ color: ogTheme.fg, fontWeight: 700 }}>{site.name}</span>
            <span>{site.role}</span>
          </div>
          {meta && (
            <div style={{ display: "flex", fontFamily: "JetBrains Mono", fontSize: 19 }}>
              {meta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
