"use client";

import { m } from "framer-motion";
import { type ReactNode, useEffect } from "react";

// Skip the entrance on the first (server-rendered) paint so LCP is not delayed;
// animate only on client-side navigations.
let hasNavigated = false;

export function PageTransition({ children }: { children: ReactNode }) {
  const animate = hasNavigated;
  useEffect(() => {
    hasNavigated = true;
  }, []);
  return (
    <m.div
      initial={animate ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </m.div>
  );
}
