/** Post categories. Keys are URL slugs and the only values allowed in post frontmatter. */
export const categories = {
  devops: {
    title: "DevOps",
    description: "CI/CD, containers, monorepos and the plumbing that ships software.",
  },
  cloud: {
    title: "Cloud",
    description: "AWS architecture, infrastructure as code and cost-aware design.",
  },
  "ai-agents": {
    title: "AI Agents",
    description: "Building, evaluating and operating LLM-powered agents.",
  },
  automation: {
    title: "Automation",
    description: "Pipelines and scripts that remove toil from real workflows.",
  },
} as const;

export type CategorySlug = keyof typeof categories;

export const categorySlugs = Object.keys(categories) as [CategorySlug, ...CategorySlug[]];

export function isCategorySlug(value: string): value is CategorySlug {
  return Object.hasOwn(categories, value);
}
