import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useQuizTimer } from "../useQuizTimer";

describe("useQuizTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks down toward zero", () => {
    const { result } = renderHook(() => useQuizTimer(10, () => {}));
    expect(result.current).toBe(10);
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current).toBeLessThanOrEqual(9);
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current).toBeLessThanOrEqual(6);
  });

  it("fires onExpire when reaching zero", () => {
    const onExpire = vi.fn();
    renderHook(() => useQuizTimer(2, onExpire));
    act(() => {
      vi.advanceTimersByTime(2500);
    });
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("clears the interval on unmount", () => {
    const clearSpy = vi.spyOn(window, "clearInterval");
    const { unmount } = renderHook(() => useQuizTimer(10, () => {}));
    unmount();
    expect(clearSpy).toHaveBeenCalled();
    clearSpy.mockRestore();
  });

  it("does not start when disabled", () => {
    const onExpire = vi.fn();
    const { result } = renderHook(() =>
      useQuizTimer(5, onExpire, /* enabled */ false),
    );
    act(() => {
      vi.advanceTimersByTime(10000);
    });
    expect(onExpire).not.toHaveBeenCalled();
    expect(result.current).toBe(5);
  });
});
