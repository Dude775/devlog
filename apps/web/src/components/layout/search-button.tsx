"use client";

import { useCommandMenu } from "@/components/command/command-menu-context";
import { SearchIcon } from "@/components/ui/icons";

export function SearchButton() {
  const { setOpen } = useCommandMenu();
  return (
    <button
      type="button"
      onClick={() => {
        setOpen(true);
      }}
      aria-label="Open command menu"
      aria-keyshortcuts="Meta+K Control+K"
      className="inline-flex h-9 items-center gap-2 rounded-lg border border-border bg-surface/60 px-2.5 text-sm text-subtle transition-colors hover:border-border-strong hover:text-fg sm:w-52"
    >
      <SearchIcon />
      <span className="hidden flex-1 text-start sm:inline">Search…</span>
      <kbd className="hidden rounded border border-border px-1.5 font-mono text-[0.65rem] sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
