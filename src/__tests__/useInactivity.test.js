import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useInactivity from "../hooks/useInactivity";

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());
const tick = (s) => act(() => { vi.advanceTimersByTime(s * 1000); });

describe("useInactivity", () => {
  it("warns after the limit and times out after limit + grace", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useInactivity({ enabled: true, limit: 10, grace: 5, onTimeout }));
    tick(9);
    expect(result.current.warning).toBe(false);
    tick(1);
    expect(result.current.warning).toBe(true);
    expect(result.current.secondsLeft).toBe(5);
    expect(onTimeout).not.toHaveBeenCalled();
    tick(5);
    expect(onTimeout).toHaveBeenCalled();
  });
  it("touch resets the idle counter", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useInactivity({ enabled: true, limit: 10, grace: 5, onTimeout }));
    tick(12);
    act(() => result.current.touch());
    expect(result.current.warning).toBe(false);
    tick(5);
    expect(onTimeout).not.toHaveBeenCalled();
  });
  it("does nothing when disabled", () => {
    const onTimeout = vi.fn();
    const { result } = renderHook(() => useInactivity({ enabled: false, limit: 1, grace: 1, onTimeout }));
    tick(60);
    expect(result.current.warning).toBe(false);
    expect(onTimeout).not.toHaveBeenCalled();
  });
});
