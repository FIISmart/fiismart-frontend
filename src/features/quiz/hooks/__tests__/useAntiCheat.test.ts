import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAntiCheat } from "../useAntiCheat";

function setVisibility(state: "visible" | "hidden") {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => state,
  });
}

function setFullscreen(active: boolean) {
  Object.defineProperty(document, "fullscreenElement", {
    configurable: true,
    get: () => (active ? document.documentElement : null),
  });
}

describe("useAntiCheat", () => {
  beforeEach(() => {
    setVisibility("visible");
    setFullscreen(true);
  });

  it("does not fire when enabled is false", () => {
    const onViolation = vi.fn();
    renderHook(() => useAntiCheat({ enabled: false, onViolation }));
    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(onViolation).not.toHaveBeenCalled();
  });

  it("fires 'hidden' when visibility changes to hidden", () => {
    const onViolation = vi.fn();
    renderHook(() => useAntiCheat({ enabled: true, onViolation }));
    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(onViolation).toHaveBeenCalledTimes(1);
    expect(onViolation.mock.calls[0][0].kind).toBe("hidden");
  });

  it("does NOT fire on window.blur (review fix: blur is a false-positive source)", () => {
    const onViolation = vi.fn();
    renderHook(() => useAntiCheat({ enabled: true, onViolation }));
    window.dispatchEvent(new Event("blur"));
    expect(onViolation).not.toHaveBeenCalled();
  });

  it("fires 'fullscreen_exit' when fullscreenElement becomes null", () => {
    const onViolation = vi.fn();
    renderHook(() => useAntiCheat({ enabled: true, onViolation }));
    setFullscreen(false);
    document.dispatchEvent(new Event("fullscreenchange"));
    expect(onViolation).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "fullscreen_exit" }),
    );
  });

  it("fires 'pagehide' on window pagehide", () => {
    const onViolation = vi.fn();
    renderHook(() => useAntiCheat({ enabled: true, onViolation }));
    window.dispatchEvent(new Event("pagehide"));
    expect(onViolation).toHaveBeenCalledWith(
      expect.objectContaining({ kind: "pagehide" }),
    );
  });

  it("removes all listeners on unmount", () => {
    const onViolation = vi.fn();
    const { unmount } = renderHook(() =>
      useAntiCheat({ enabled: true, onViolation }),
    );
    unmount();
    setVisibility("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    setFullscreen(false);
    document.dispatchEvent(new Event("fullscreenchange"));
    window.dispatchEvent(new Event("pagehide"));
    expect(onViolation).not.toHaveBeenCalled();
  });
});
