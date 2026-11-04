import { type Metadata } from "next";
import { type ReactNode } from "react";
import { publicEnv } from "@/env";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.NEXT_PUBLIC_SITE_URL),
  title: { default: "David Rubin | DevOps & Cloud", template: "%s | David Rubin" },
  description: "Tech blog and project showcase by David Rubin, DevOps/Cloud engineer.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white font-sans text-zinc-900 antialiased dark:bg-zinc-950 dark:text-zinc-100">
        {children}
      </body>
    </html>
  );
}
