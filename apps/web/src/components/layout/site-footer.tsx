import { site } from "@/config/site";
import { NewsletterForm } from "@/components/forms/newsletter-form";
import { Container } from "@/components/ui/container";
import { GitHubIcon, LinkedInIcon, MailIcon } from "@/components/ui/icons";

const links = [
  { href: site.social.github, label: "GitHub", Icon: GitHubIcon },
  { href: site.social.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
  { href: `mailto:${site.social.email}`, label: "Email", Icon: MailIcon },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <Container className="flex flex-col gap-4 border-b border-border py-10 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-sm">
          <p className="font-medium text-fg">New posts, no noise</p>
          <p className="mt-1 text-sm text-muted">
            An occasional email when something new ships. Unsubscribe anytime.
          </p>
        </div>
        <NewsletterForm />
      </Container>
      <Container className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div className="font-mono text-xs text-subtle">
          <p>
            <span className="text-accent-text">$</span> echo &quot;© {new Date().getFullYear()}{" "}
            {site.name}&quot;
          </p>
          <p className="mt-1">
            Projects in depth on the{" "}
            <a
              href={site.portfolioUrl}
              className="text-muted underline-offset-4 hover:text-fg hover:underline"
            >
              portfolio
            </a>
            . Source on{" "}
            <a
              href={site.repoUrl}
              className="text-muted underline-offset-4 hover:text-fg hover:underline"
            >
              GitHub
            </a>
            .
          </p>
        </div>
        <ul className="flex items-center gap-1" aria-label="Social links">
          {links.map(({ href, label, Icon }) => (
            <li key={label}>
              <a
                href={href}
                {...(href.startsWith("http")
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
                className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-surface-2 hover:text-fg"
                aria-label={label}
              >
                <Icon width={18} height={18} />
              </a>
            </li>
          ))}
        </ul>
      </Container>
    </footer>
  );
}
