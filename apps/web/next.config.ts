import path from "node:path";
import { fileURLToPath } from "node:url";
import { type NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER, PHASE_PRODUCTION_BUILD } from "next/constants";

const monorepoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "../..");

const nextConfig: NextConfig = {
  output: "standalone",
  outputFileTracingRoot: monorepoRoot,
  transpilePackages: ["@devlog/shared"],
  poweredByHeader: false,
  reactStrictMode: true,
  typedRoutes: true,
  // Lint runs as its own Turbo task; avoid a second, divergent pass inside next build.
  eslint: { ignoreDuringBuilds: true },
};

/** Runs velite (MDX -> typed content) in-process for `next dev` / `next build`. */
export default async function config(phase: string): Promise<NextConfig> {
  const isDev = phase === PHASE_DEVELOPMENT_SERVER;
  if ((isDev || phase === PHASE_PRODUCTION_BUILD) && !process.env.VELITE_STARTED) {
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    await build({ watch: isDev, clean: !isDev });
  }
  return nextConfig;
}
