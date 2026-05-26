import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useFreeze } from "../useFreeze";

describe("useFreeze", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts not frozen", () => {
    const { result } = renderHook(() => useFreeze(30));
    expect(result.current.frozen).toBe(false);
    expect(result.current.secondsLeft).toBe(0);
  });

  it("freeze() sets frozen true and counts down", () => {
    const { result } = renderHook(() => useFreeze(30));
    act(() => {
      result.current.freeze();
    });
    expect(result.current.frozen).toBe(true);
    expect(result.current.secondsLeft).toBe(30);
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.secondsLeft).toBeLessThanOrEqual(25);
    expect(result.current.frozen).toBe(true);
  });

  it("auto-unfreezes once the deadline elapses", () => {
    const { result } = renderHook(() => useFreeze(3));
    act(() => {
      result.current.freeze();
    });
    act(() => {
      vi.advanceTimersByTime(4000);
    });
    expect(result.current.frozen).toBe(false);
    expect(result.current.secondsLeft).toBe(0);
  });

  it("calling freeze() while frozen extends the deadline", () => {
    const { result } = renderHook(() => useFreeze(30));
    act(() => {
      result.current.freeze();
    });
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    const midway = result.current.secondsLeft;
    act(() => {
      result.current.freeze();
    });
    expect(result.current.secondsLeft).toBeGreaterThan(midway);
  });

  it("clears the interval on unmount", () => {
    const clearSpy = vi.spyOn(window, "clearInterval");
    const { result, unmount } = renderHook(() => useFreeze(30));
    act(() => {
      result.current.freeze();
    });
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });
});
