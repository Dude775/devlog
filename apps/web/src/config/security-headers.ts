/**
 * HTTP security headers for every web route (wired in next.config.ts).
 *
 * The site is statically rendered, so the CSP cannot carry a per-request nonce without turning
 * every page dynamic. Scripts are therefore limited to same-origin files plus the inline bootstrap
 * Next.js and next-themes emit (`'unsafe-inline'`); everything else is locked down. See
 * docs/DEPLOYMENT.md#security-headers for the trade-off.
 */
export interface SecurityHeaderOptions {
  /** Browser-facing API base URL (NEXT_PUBLIC_API_URL); its origin is allowed in connect-src. */
  apiUrl: string;
  /** Canonical site URL (NEXT_PUBLIC_SITE_URL); `https:` enables upgrade-insecure-requests. */
  siteUrl: string;
  /** `next dev` needs eval for React Refresh. */
  isDev: boolean;
}

export function buildContentSecurityPolicy({ apiUrl, siteUrl, isDev }: SecurityHeaderOptions) {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    // Tailwind output is a file, but framer-motion, mermaid SVGs and next/font set inline styles.
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", new URL(apiUrl).origin, ...(isDev ? ["ws:"] : [])],
    "worker-src": ["'self'", "blob:"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  const policy = Object.entries(directives).map(([name, values]) => `${name} ${values.join(" ")}`);
  if (!isDev && new URL(siteUrl).protocol === "https:") policy.push("upgrade-insecure-requests");
  return policy.join("; ");
}

export function securityHeaders(options: SecurityHeaderOptions): { key: string; value: string }[] {
  return [
    { key: "Content-Security-Policy", value: buildContentSecurityPolicy(options) },
    // Ignored by browsers over plain HTTP, so it is safe to send everywhere.
    { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value:
        "accelerometer=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=(), browsing-topics=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "X-DNS-Prefetch-Control", value: "on" },
  ];
}
