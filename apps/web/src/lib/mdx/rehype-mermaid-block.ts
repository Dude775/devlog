/**
 * Turns fenced ```mermaid blocks into `<Mermaid chart="...">` before rehype-pretty-code
 * highlights them. The MDX source stays plain Markdown (renders on GitHub too); the
 * diagram itself is drawn client-side by `components/mdx/mermaid.tsx`.
 */
interface HastText {
  type: "text";
  value: string;
  children?: undefined;
}
interface HastElement {
  type: "element";
  tagName: string;
  properties: Record<string, unknown>;
  children: HastNode[];
}
interface HastOther {
  type: string;
  children?: HastNode[];
}
type HastNode = HastText | HastElement | HastOther;

const isElement = (n: HastNode): n is HastElement => n.type === "element";

function textOf(node: HastNode): string {
  if (node.type === "text") return (node as HastText).value;
  return (node.children ?? []).map(textOf).join("");
}

function mermaidSource(pre: HastElement): string | undefined {
  const code = pre.children.find(isElement);
  if (code?.tagName !== "code") return undefined;
  const cls = code.properties.className;
  return Array.isArray(cls) && cls.includes("language-mermaid") ? textOf(code).trim() : undefined;
}

function walk(node: HastNode): void {
  const children = node.children;
  if (!children) return;
  node.children = children.map((child): HastNode => {
    if (isElement(child) && child.tagName === "pre") {
      const chart = mermaidSource(child);
      if (chart !== undefined) {
        return { type: "element", tagName: "Mermaid", properties: { chart }, children: [] };
      }
    }
    walk(child);
    return child;
  });
}

export default function rehypeMermaidBlock() {
  return (tree: HastNode) => {
    walk(tree);
  };
}
