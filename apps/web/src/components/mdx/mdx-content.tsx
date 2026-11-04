import { run } from "@mdx-js/mdx";
import { type MDXComponents } from "mdx/types";
import { type Route } from "next";
import Link from "next/link";
import { type AnchorHTMLAttributes } from "react";
import * as runtime from "react/jsx-runtime";
import { CodeBlock } from "@/components/ui/code-block";
import { Callout } from "./callout";
import { Mermaid } from "./mermaid";

function MdxLink({ href = "", children, className, id }: AnchorHTMLAttributes<HTMLAnchorElement>) {
  const props = { ...(className ? { className } : {}), ...(id ? { id } : {}) };
  if (href.startsWith("/")) {
    return (
      <Link href={href as Route} {...props}>
        {children}
      </Link>
    );
  }
  if (href.startsWith("#")) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

const components: MDXComponents = {
  a: MdxLink,
  pre: CodeBlock,
  Callout,
  Mermaid,
};

/** Evaluates velite's build-time compiled MDX (function-body) on the server. */
export async function MdxContent({ code }: { code: string }) {
  const { default: Content } = await run(code, { ...runtime, baseUrl: import.meta.url });
  return <Content components={components} />;
}
