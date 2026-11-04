"use client";

import { LazyMotion, MotionConfig, domAnimation } from "framer-motion";
import { ThemeProvider } from "next-themes";
import { type ReactNode } from "react";
import { CommandMenuProvider } from "./command/command-menu-context";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <LazyMotion features={domAnimation} strict>
        <MotionConfig reducedMotion="user">
          <CommandMenuProvider>{children}</CommandMenuProvider>
        </MotionConfig>
      </LazyMotion>
    </ThemeProvider>
  );
}
