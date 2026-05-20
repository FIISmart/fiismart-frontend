import { useCallback, useEffect, useRef, useState } from "react";

export interface FreezeState {
  /** True while the freeze deadline is in the future. */
  frozen: boolean;
  /** Whole seconds remaining until unfreeze (0 when not frozen). */
  secondsLeft: number;
  /** Start or extend the freeze (sets deadline to `now + freezeDurationSec`). */
  freeze: () => void;
}

const DEFAULT_DURATION_SEC = 30;

/**
 * Date.now()-driven freeze (same pattern as useQuizTimer) — robust against
 * throttled tabs. The hook auto-unfreezes when the deadline passes; calling
 * `freeze()` again while already frozen resets the deadline (extends the freeze).
 */
export function useFreeze(freezeDurationSec: number = DEFAULT_DURATION_SEC): FreezeState {
  const [deadline, setDeadline] = useState<number | null>(null);
  const [secondsLeft, setSecondsLeft] = useState(0);

  const freeze = useCallback(() => {
    setDeadline(Date.now() + freezeDurationSec * 1000);
  }, [freezeDurationSec]);

  useEffect(() => {
    if (deadline === null) {
      setSecondsLeft(0);
      return;
    }

    const tick = () => {
      const remSec = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setSecondsLeft(remSec);
      if (remSec === 0) {
        setDeadline(null);
      }
    };

    tick();
    const id = window.setInterval(tick, 250);
    return () => window.clearInterval(id);
  }, [deadline]);

  return {
    frozen: secondsLeft > 0,
    secondsLeft,
    freeze,
  };
}
