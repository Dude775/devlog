/** Static site identity. Single source of truth for names, links and nav. */
export const site = {
  name: "David Rubin",
  handle: "dude775",
  title: "devlog",
  role: "DevOps & Cloud Engineer",
  description:
    "Engineering deep-dives on DevOps, cloud and automation by David Rubin. Projects live on the portfolio; the stories behind them live here.",
  portfolioUrl: "https://system-portfolio.vercel.app",
  repoUrl: "https://github.com/Dude775/devlog",
  social: {
    github: "https://github.com/Dude775",
    linkedin: "https://www.linkedin.com/in/david-rubin-a02029338",
    email: "Drubin877@gmail.com",
  },
} as const;

export const mainNav = [
  { href: "/blog", label: "Blog" },
  { href: "/projects", label: "Projects" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
