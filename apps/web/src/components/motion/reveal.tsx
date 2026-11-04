"use client";

import { m } from "framer-motion";
import { type ReactNode } from "react";

export interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: "div" | "li" | "section";
}

/** Fades content up once when it enters the viewport. Reduced motion is handled by <MotionConfig>. */
export function Reveal({ children, delay = 0, className, as = "div" }: RevealProps) {
  const Comp = m[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Comp>
  );
}
