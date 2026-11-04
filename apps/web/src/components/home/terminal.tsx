"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export interface TerminalLine {
  command: string;
  output: string[];
}

const TYPE_MS = 55;
const PAUSE_MS = 380;

/**
 * Animated shell intro. Screen readers get the full transcript up front;
 * the animated layer is aria-hidden. Reduced motion shows the final state.
 */
export function Terminal({ lines, title = "zsh" }: { lines: TerminalLine[]; title?: string }) {
  const reduce = useReducedMotion();
  // step = number of characters typed across all commands, plus pauses for outputs.
  const total = lines.reduce((n, l) => n + l.command.length + 1, 0);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (step >= total) return;
    if (reduce) {
      // Jump straight to the final transcript (deferred so SSR and hydration markup match).
      const t = setTimeout(() => {
        setStep(total);
      }, 0);
      return () => {
        clearTimeout(t);
      };
    }
    const atLineEnd = (() => {
      let acc = 0;
      for (const l of lines) {
        acc += l.command.length + 1;
        if (step === acc - 1) return true;
      }
      return false;
    })();
    const t = setTimeout(
      () => {
        setStep((s) => s + 1);
      },
      atLineEnd ? PAUSE_MS : TYPE_MS + Math.random() * 40,
    );
    return () => {
      clearTimeout(t);
    };
  }, [step, total, lines, reduce]);

  const progress = step;
  let consumed = 0;

  return (
    <div
      className="overflow-hidden rounded-xl border border-border-strong bg-surface/80 shadow-2xl shadow-black/20 backdrop-blur"
      dir="ltr"
    >
      <div className="flex h-9 items-center gap-2 border-b border-border px-3.5">
        <span aria-hidden className="flex gap-1.5">
          <span className="size-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="size-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="size-2.5 rounded-full bg-[#28c840]/80" />
        </span>
        <span className="mx-auto font-mono text-[0.7rem] text-subtle">{title}</span>
      </div>

      <div className="sr-only">
        {lines.map((l) => (
          <p key={l.command}>
            {`$ ${l.command}`} {l.output.join(" ")}
          </p>
        ))}
      </div>

      <div
        aria-hidden
        className="min-h-[15.5rem] p-4 font-mono text-[0.8rem] leading-relaxed sm:text-sm"
      >
        {lines.map((line, i) => {
          const start = consumed;
          consumed += line.command.length + 1;
          if (progress < start) return null;
          const typed = line.command.slice(0, Math.max(0, progress - start));
          const done = progress >= start + line.command.length + 1;
          const isCurrent = !done && progress >= start;
          return (
            <div key={line.command} className={i > 0 ? "mt-3" : undefined}>
              <p>
                <span className="text-accent-text">❯</span> <span className="text-subtle">~</span>{" "}
                <span className="text-fg">{typed}</span>
                {isCurrent && <Cursor />}
              </p>
              {done &&
                line.output.map((o) => (
                  <p key={o} className="text-muted">
                    {o}
                  </p>
                ))}
            </div>
          );
        })}
        {progress >= total && (
          <p className="mt-3">
            <span className="text-accent-text">❯</span> <span className="text-subtle">~</span>{" "}
            <Cursor />
          </p>
        )}
      </div>
    </div>
  );
}

function Cursor() {
  return (
    <span className="inline-block h-[1.05em] w-[0.55em] translate-y-[0.15em] bg-accent motion-safe:animate-blink" />
  );
}
