import { useEffect, useRef, useCallback } from "react";

interface Props {
  /** Whether the overlay is visible (controlled by parent). */
  frozen: boolean;
  /** Whole seconds remaining on the freeze; rendered as a countdown. */
  secondsLeft: number;
  /** Called when the user dismisses the overlay (e.g. clicks "Inteleg"). */
  onDismiss: () => void;
}

/**
 * Modal "freeze" overlay shown after an anti-cheat violation.
 *
 * a11y notes (review #6):
 *  - `role="alertdialog"`: this is an *interruption*, not a passive dialog —
 *    screen readers will announce it immediately and treat it as needing user
 *    attention. Plain `role="dialog"` would be wrong (no implicit alert).
 *  - Focus is moved to the dismiss button on mount; previously focused element
 *    is restored on unmount.
 *  - Tab/Shift+Tab is trapped inside the overlay so keyboard users cannot
 *    accidentally interact with the (still mounted) quiz behind it.
 *  - All visible copy is in Romanian to match the rest of the quiz UI.
 */
export function FreezeOverlay({ frozen, secondsLeft, onDismiss }: Props) {
  const dismissBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const previouslyFocusedRef = useRef<HTMLElement | null>(null);

  // Move focus into the overlay when it opens; restore it when it closes.
  useEffect(() => {
    if (!frozen) return;
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null;
    dismissBtnRef.current?.focus();
    return () => {
      previouslyFocusedRef.current?.focus?.();
    };
  }, [frozen]);

  // Basic focus trap: cycle Tab through focusable elements inside the overlay.
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
      <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-2xl">
        <h2
          id="freeze-overlay-title"
          className="mb-3 text-2xl font-bold text-[#5A4A3A]"
        >
          Quiz inghetat
        </h2>
        <p id="freeze-overlay-desc" className="mb-4 text-sm text-[#6A7282]">
          Esti in stare de inghet. Quiz-ul continua dar timpul curge. Revino in
          fereastra principala.
        </p>
        <div
          aria-live="polite"
          className="mb-6 text-5xl font-bold tabular-nums text-[#9B8EC7]"
        >
          {secondsLeft}s
        </div>
        <button
          ref={dismissBtnRef}
          type="button"
          onClick={onDismiss}
          className="w-full rounded-[16px] bg-gradient-to-r from-[#BDA6CE] to-[#9B8EC7] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Inteleg
        </button>
      </div>
    </div>
  );
}

export default FreezeOverlay;
