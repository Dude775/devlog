/**
 * Moves the rehype-pretty-code `<figcaption>` title (```ts title="x.ts") onto the
 * `<pre>` as `data-title`, so a single <CodeBlock> component owns the whole header.
 * Minimal local hast types keep this dependency-free.
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

function isElement(node: HastNode): node is HastElement {
  return node.type === "element";
}

// rehype-pretty-code sets raw attribute keys; standard hast uses camelCase. Accept both.
function isPrettyCodeFigure(node: HastElement): boolean {
  return (
    "data-rehype-pretty-code-figure" in node.properties ||
    "dataRehypePrettyCodeFigure" in node.properties
  );
}

function textOf(node: HastNode): string {
  if (node.type === "text") return (node as HastText).value;
  return (node.children ?? []).map(textOf).join("");
}

function walk(node: HastNode): void {
  const children = node.children;
  if (!children) return;
  for (const child of children) {
    if (isElement(child) && child.tagName === "figure" && isPrettyCodeFigure(child)) {
      const caption = child.children.find(
        (c): c is HastElement => isElement(c) && c.tagName === "figcaption",
      );
      const pre = child.children.find((c): c is HastElement => isElement(c) && c.tagName === "pre");
      if (caption && pre) {
        pre.properties["data-title"] = textOf(caption).trim();
        child.children = child.children.filter((c) => c !== caption);
      }
    }
    walk(child);
  }
}

export default function rehypeCodeMeta() {
  return (tree: HastNode) => {
    walk(tree);
  };
}
