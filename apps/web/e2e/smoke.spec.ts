import { expect, test, type Page } from "@playwright/test";

const POST = {
  path: "/blog/building-this-blog-monorepo-architecture",
  title: "Building this blog: monorepo architecture and separation of concerns",
};

/** Fails the test on uncaught page errors or CSP violations (the API being down is expected). */
function watchForErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() === "error" && /content security policy/i.test(msg.text())) {
      errors.push(`csp: ${msg.text()}`);
    }
  });
  return errors;
}

test("home renders with security headers", async ({ page }) => {
  const errors = watchForErrors(page);
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);

  const headers = res?.headers() ?? {};
  expect(headers["content-security-policy"]).toContain("frame-ancestors 'none'");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-powered-by"]).toBeUndefined();

  await expect(page).toHaveTitle(/David Rubin/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("link", { name: POST.title }).first()).toBeVisible();
  expect(errors).toEqual([]);
});

test("post renders content, toc and mermaid diagram", async ({ page }) => {
  const errors = watchForErrors(page);
  const res = await page.goto(POST.path);
  expect(res?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1, name: POST.title })).toBeVisible();
  await expect(page.locator("article")).toContainText("monorepo");
  // Mermaid loads lazily on the client; an <svg> proves hydration works under the CSP.
  await expect(page.getByRole("img", { name: "Diagram" }).first().locator("svg")).toBeVisible();
  expect(errors).toEqual([]);
});

test("projects lists cards linking to repo and portfolio", async ({ page }) => {
  const res = await page.goto("/projects");
  expect(res?.status()).toBe(200);

  await expect(page.getByRole("heading", { level: 1, name: "Projects" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "devlog" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Repository for devlog/ })).toHaveAttribute(
    "href",
    "https://github.com/Dude775/devlog",
  );
});

test("unknown route returns 404 page", async ({ page }) => {
  const res = await page.goto("/this-route-does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Page not found" })).toBeVisible();
});

test("cmd+k opens the command palette and navigates to a post", async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto("/");
  // Wait for hydration: the shortcut handler is attached on the client.
  await expect(page.getByRole("button", { name: "Open command menu" })).toBeEnabled();

  const dialog = page.getByRole("dialog", { name: "Command menu" });
  await expect(async () => {
    if (!(await dialog.isVisible())) await page.keyboard.press("ControlOrMeta+k");
    await expect(dialog).toBeVisible({ timeout: 1_000 });
  }).toPass();

  await dialog.getByPlaceholder("Search posts, projects, pages…").fill("monorepo architecture");
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(new RegExp(`${POST.path}$`));
  await expect(page.getByRole("heading", { level: 1, name: POST.title })).toBeVisible();
  expect(errors).toEqual([]);
});
