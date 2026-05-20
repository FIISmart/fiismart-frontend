import { useEffect, useRef } from "react";

export type ViolationKind = "hidden" | "fullscreen_exit" | "pagehide";

export interface AntiCheatViolation {
  kind: ViolationKind;
  at: number;
}

interface Options {
  enabled: boolean;
  onViolation: (violation: AntiCheatViolation) => void;
}

/**
 * Emits violation events for likely cheating signals. The consumer decides how
 * to react (freeze, soft-warn, submit, etc.) — this hook is signal-only.
 *
 * Triggers:
 *  - `visibilitychange` → "hidden" (tab/app switch, lock screen, minimize)
 *  - `fullscreenchange` → "fullscreen_exit" (Esc out of fullscreen)
 *  - `pagehide` → "pagehide" (browser navigation away, terminal exit)
 *
 * Deliberately NOT triggered:
 *  - `window.blur`: too noisy. DevTools focus, OS notifications, screen readers,
 *    pinned tab focus changes, and even some keyboards (IME composition popup)
 *    all fire blur without the student actually leaving the quiz. The review
 *    explicitly flagged Schiporash's blur trigger as a false-positive source.
 *    We rely on `visibilitychange` (which fires reliably on real tab switches)
 *    + `fullscreenchange` instead.
 */
export function useAntiCheat({ enabled, onViolation }: Options): void {
  const onViolationRef = useRef(onViolation);

  useEffect(() => {
    onViolationRef.current = onViolation;
  }, [onViolation]);

  useEffect(() => {
    if (!enabled) return;

    const fire = (kind: ViolationKind) => {
      onViolationRef.current({ kind, at: Date.now() });
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        fire("hidden");
      }
    };
    const onFullscreenChange = () => {
      if (!document.fullscreenElement) {
        fire("fullscreen_exit");
      }
    };
    const onPageHide = () => {
      fire("pagehide");
    };

    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    window.addEventListener("pagehide", onPageHide);

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      window.removeEventListener("pagehide", onPageHide);
    };
  }, [enabled]);
}
