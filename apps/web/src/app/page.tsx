import { posts } from "#site/content";

export default function HomePage() {
  const published = posts.filter((p) => !p.draft).sort((a, b) => b.date.localeCompare(a.date));

  return (
    <main className="mx-auto max-w-2xl px-6 py-24">
      <h1 className="text-5xl font-bold tracking-tight">Hello</h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        DevOps, cloud and the occasional yak shave. Built with Next.js, Hono and PostgreSQL.
      </p>
      <section className="mt-12">
        <h2 className="font-mono text-sm uppercase tracking-widest text-zinc-500">Latest posts</h2>
        <ul className="mt-4 space-y-3">
          {published.map((post) => (
            <li key={post.slug}>
              <span className="font-medium">{post.title}</span>
              <span className="ml-2 font-mono text-xs text-zinc-500">{post.date.slice(0, 10)}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
