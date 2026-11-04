import { afterEach, describe, expect, it } from "vitest";
import { createMemoryRateLimitStore } from "./memory-store";

let t = 0;
const now = () => t;
const stores: { close: () => Promise<void> }[] = [];
afterEach(async () => {
  t = 0;
  await Promise.all(stores.splice(0).map((s) => s.close()));
});

function store(maxKeys?: number) {
  const s = createMemoryRateLimitStore({ now, ...(maxKeys ? { maxKeys } : {}) });
  stores.push(s);
  return s;
}

describe("memory rate-limit store", () => {
  it("counts hits within a window and resets after it", async () => {
    const s = store();
    await s.hit("k", 1000);
    await expect(s.hit("k", 1000)).resolves.toEqual({ count: 2, resetAt: 1000 });
    t = 1000;
    await expect(s.hit("k", 1000)).resolves.toEqual({ count: 1, resetAt: 2000 });
  });

  it("tracks keys independently", async () => {
    const s = store();
    await s.hit("a", 1000);
    await expect(s.hit("b", 1000)).resolves.toMatchObject({ count: 1 });
  });

  it("caps memory by evicting expired, then oldest, keys", async () => {
    const s = store(2);
    await s.hit("a", 1000);
    await s.hit("b", 1000);
    await s.hit("c", 1000);
    expect(s.size()).toBe(2);
    // "a" was evicted, so it starts a fresh window.
    await expect(s.hit("a", 1000)).resolves.toMatchObject({ count: 1 });
  });
});
