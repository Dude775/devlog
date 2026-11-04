import { defineConfig, devices } from "@playwright/test";

const PORT = 3100;
const isCI = Boolean(process.env.CI);

/**
 * Smoke tests against the standalone production server, the same artifact the Docker image runs
 * (`next build` must have run; turbo `test:e2e` depends on `build`).
 * The API is intentionally not started: pages must render and stay interactive without it.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command:
      "cp -r public .next/standalone/apps/web/ && cp -r .next/static .next/standalone/apps/web/.next/ && node .next/standalone/apps/web/server.js",
    env: { PORT: String(PORT), HOSTNAME: "127.0.0.1" },
    url: `http://127.0.0.1:${PORT}`,
    reuseExistingServer: !isCI,
    timeout: 60_000,
  },
});
