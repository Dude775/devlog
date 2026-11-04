import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowLeft } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <Container size="prose" className="py-24 sm:py-32">
      <div className="overflow-hidden rounded-xl border border-border-strong bg-surface/80 font-mono text-sm">
        <div className="border-b border-border px-4 py-2 text-xs text-subtle">bash</div>
        <div className="space-y-1 p-5">
          <p>
            <span className="text-accent-text">❯</span>{" "}
            <span className="text-fg">cd ./this-page</span>
          </p>
          <p className="text-muted">bash: cd: ./this-page: No such file or directory</p>
          <p className="text-subtle">exit status 404</p>
        </div>
      </div>
      <h1 className="mt-10 text-title font-semibold text-fg">Page not found</h1>
      <p className="mt-3 text-muted">
        The page moved, never existed, or is still in a feature branch.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/" className={buttonVariants()}>
          <ArrowLeft /> Home
        </Link>
        <Link href="/blog" className={buttonVariants({ variant: "secondary" })}>
          Browse posts
        </Link>
      </div>
    </Container>
  );
}
