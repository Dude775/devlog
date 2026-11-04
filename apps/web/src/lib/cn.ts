/** Joins truthy class names. Kept tiny on purpose; variants are designed not to conflict. */
export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}
