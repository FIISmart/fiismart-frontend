import { useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  frozen: boolean;
  secondsLeft: number;
  onDismiss: () => void;
}

export function FreezeOverlay({ frozen, secondsLeft, onDismiss }: Props) {
  const dismissBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!frozen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    dismissBtnRef.current?.focus();
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [frozen]);

  const onKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== "Tab") return;
    const root = containerRef.current;
    if (!root) return;

    const focusables = root.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement as HTMLElement | null;

    if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  }, []);

  if (!frozen) return null;

  return (
    <div
      ref={containerRef}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="freeze-overlay-title"
      aria-describedby="freeze-overlay-desc"
      onKeyDown={onKeyDown}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm"
    >
      <div className="max-w-md rounded-2xl bg-card p-8 text-center shadow-2xl">
        <h2
          id="freeze-overlay-title"
          className="mb-3 text-2xl font-bold text-foreground"
        >
          Quiz inghetat
        </h2>
        <p id="freeze-overlay-desc" className="mb-4 text-sm text-muted-foreground">
          Esti in stare de inghet. Quiz-ul continua dar timpul curge. Revino in
          fereastra principala.
        </p>
        <div
          aria-live="polite"
          className="mb-6 text-5xl font-bold tabular-nums text-primary"
        >
          {secondsLeft}s
        </div>
        <Button
          ref={dismissBtnRef}
          onClick={onDismiss}
          className="w-full bg-gradient-to-r from-secondary to-primary"
        >
          Inteleg
        </Button>
      </div>
    </div>
  );
}

export default FreezeOverlay;