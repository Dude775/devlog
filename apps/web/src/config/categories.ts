/** Post categories. Keys are URL slugs and the only values allowed in post frontmatter. */
export const categories = {
  devops: {
    title: "DevOps",
    description: "Monorepos, containers, release engineering and the plumbing that ships software.",
  },
  "cloud-aws": {
    title: "Cloud / AWS",
    description: "AWS architecture, networking, IAM and cost-aware design.",
  },
  kubernetes: {
    title: "Kubernetes",
    description: "Clusters, workloads, Helm and operating containers at scale.",
  },
  "ci-cd": {
    title: "CI/CD",
    description: "Pipelines, caching, quality gates and deploy strategies.",
  },
  "iac-terraform": {
    title: "IaC / Terraform",
    description: "Infrastructure as code: modules, state, drift and reviewable infra changes.",
  },
  observability: {
    title: "Observability",
    description: "Logs, metrics, traces, health checks and alerting that means something.",
  },
  "osint-research": {
    title: "OSINT Research",
    description: "Open-source intelligence methodology, verification and AI-assisted research.",
  },
  career: {
    title: "Career",
    description: "Moving into DevOps: decisions, learning paths and lessons from the switch.",
  },
  "build-log": {
    title: "Build Log",
    description: "How this site and my other projects are built, decision by decision.",
  },
} as const;

export type CategorySlug = keyof typeof categories;

export const categorySlugs = Object.keys(categories) as [CategorySlug, ...CategorySlug[]];

export function isCategorySlug(value: string): value is CategorySlug {
  return Object.hasOwn(categories, value);
}
