"use client";

import { m, useReducedMotion, useScroll, useSpring } from "framer-motion";

export function ReadingProgress() {
  const { scrollYProgress } = useScroll();
  const reduce = useReducedMotion();
  const smooth = useSpring(scrollYProgress, { stiffness: 140, damping: 28, mass: 0.3 });
  return (
    <m.div
      aria-hidden
      className="fixed inset-x-0 top-0 z-50 h-0.5 origin-left bg-accent shadow-[0_0_12px_rgb(34_211_238/0.7)]"
      style={{ scaleX: reduce ? scrollYProgress : smooth }}
    />
  );
}
