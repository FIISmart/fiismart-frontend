import { useEffect, useRef, useState } from "react";

/**
 * Drives a countdown from a Date.now()-based deadline (not a setInterval-decremented
 * counter). This avoids drift on throttled tabs: even if the interval fires late or
 * the tab is suspended, recomputing `remaining = ceil((endsAt - Date.now()) / 1000)`
 * yields the true wall-clock value on the next tick.
 *
 * Polls at 4Hz (250ms) for smooth visible updates without being unnecessarily tight.
 */
export function useQuizTimer(
  totalSeconds: number,
  onExpire: () => void,
  enabled: boolean = true,
): number {
  const [remaining, setRemaining] = useState(totalSeconds);
  const onExpireRef = useRef(onExpire);
  const firedRef = useRef(false);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!enabled || totalSeconds <= 0) {
      setRemaining(Math.max(0, totalSeconds));
      return;
    }

    firedRef.current = false;
    const endsAt = Date.now() + totalSeconds * 1000;

    const tick = () => {
      const remSec = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(remSec);
      if (remSec === 0 && !firedRef.current) {
        firedRef.current = true;
        onExpireRef.current();
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [enabled, totalSeconds]);

  return remaining;
}
