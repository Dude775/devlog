import { type ReactNode } from "react";

export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <header className="max-w-3xl">
      {eyebrow && (
        <p className="font-mono text-xs tracking-widest text-accent-text uppercase">
          <span aria-hidden>{"// "}</span>
          {eyebrow}
        </p>
      )}
      <h1 className="mt-3 text-title font-semibold text-fg">{title}</h1>
      {description && <p className="mt-4 text-lg text-muted">{description}</p>}
      {children}
    </header>
  );
}
