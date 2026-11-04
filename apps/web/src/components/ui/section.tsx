import { type HTMLAttributes, type ReactNode, useId } from "react";
import { cn } from "@/lib/cn";
import { Container, type ContainerProps } from "./container";

export interface SectionProps extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string;
  title?: ReactNode;
  description?: ReactNode;
  /** Right-aligned header slot, e.g. a "View all" link. */
  action?: ReactNode;
  size?: ContainerProps["size"];
}

/** Page section with an optional mono eyebrow + title header, labelled for assistive tech. */
export function Section({
  eyebrow,
  title,
  description,
  action,
  size,
  className,
  children,
  ...props
}: SectionProps) {
  const id = useId();
  return (
    <section
      aria-labelledby={title ? id : undefined}
      className={cn("py-14 sm:py-20", className)}
      {...props}
    >
      <Container size={size}>
        {(title ?? eyebrow) && (
          <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              {eyebrow && (
                <p className="font-mono text-xs tracking-widest text-accent-text uppercase">
                  <span aria-hidden>{"// "}</span>
                  {eyebrow}
                </p>
              )}
              {title && (
                <h2
                  id={id}
                  className="mt-2 text-2xl font-semibold tracking-tight text-fg sm:text-3xl"
                >
                  {title}
                </h2>
              )}
              {description && <p className="mt-2 text-muted">{description}</p>}
            </div>
            {action}
          </header>
        )}
        {children}
      </Container>
    </section>
  );
}
