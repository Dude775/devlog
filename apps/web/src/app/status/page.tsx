import { type Metadata } from "next";
import { getApi } from "@/lib/api";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Status" };

async function loadHealth() {
  try {
    return { ok: true as const, data: await getApi().health() };
  } catch (error) {
    return { ok: false as const, message: error instanceof Error ? error.message : "unknown" };
  }
}

export default async function StatusPage() {
  const health = await loadHealth();
  return (
    <main className="mx-auto max-w-2xl px-6 py-24 font-mono text-sm">
      <h1 className="text-2xl font-bold">API status</h1>
      {health.ok ? (
        <dl className="mt-6 grid grid-cols-[8rem_1fr] gap-y-2">
          <dt className="text-zinc-500">status</dt>
          <dd className="text-emerald-600">{health.data.status}</dd>
          <dt className="text-zinc-500">version</dt>
          <dd>{health.data.version}</dd>
          <dt className="text-zinc-500">uptime</dt>
          <dd>{health.data.uptime.toFixed(1)}s</dd>
        </dl>
      ) : (
        <p className="mt-6 text-red-600">API unreachable: {health.message}</p>
      )}
    </main>
  );
}
