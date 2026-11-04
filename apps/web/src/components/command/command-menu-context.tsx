"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

interface CommandMenuState {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
}

const CommandMenuContext = createContext<CommandMenuState | null>(null);

export function CommandMenuProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const toggle = useCallback(() => {
    setOpen((o) => !o);
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
    };
  }, [toggle]);

  const value = useMemo(() => ({ open, setOpen, toggle }), [open, toggle]);
  return <CommandMenuContext.Provider value={value}>{children}</CommandMenuContext.Provider>;
}

export function useCommandMenu(): CommandMenuState {
  const ctx = useContext(CommandMenuContext);
  if (!ctx) throw new Error("useCommandMenu must be used inside <CommandMenuProvider>");
  return ctx;
}
