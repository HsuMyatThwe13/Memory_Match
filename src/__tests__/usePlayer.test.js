import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import usePlayer from "../hooks/usePlayer";

const LOW = { id: "low" };
const MED = { id: "medium" };
const game = (level, moves, wrong) => ({ theme: { id: "animals" }, level, pairs: 4, moves, wrong, time: 20 });

beforeEach(() => localStorage.clear());

describe("usePlayer", () => {
  it("rejects an empty or symbol-only name", () => {
    const { result } = renderHook(() => usePlayer());
    let ok;
    act(() => { ok = result.current.signIn("  !!  "); });
    expect(ok).toBe(false);
    expect(result.current.name).toBe("");
  });
  it("signs in, creates an empty profile, and persists across reload", () => {
    const first = renderHook(() => usePlayer());
    act(() => { first.result.current.signIn("Ann"); });
    expect(first.result.current.profile.cards).toEqual({ peek: 0, autoMatch: 0, freeze: 0 });
    const second = renderHook(() => usePlayer());
    expect(second.result.current.name).toBe("Ann");
  });
  it("awards a card for a qualifying win and records history", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.signIn("Ann"); });
    let earned;
    act(() => { earned = result.current.recordClassic(game(LOW, 5, 0)); });
    expect(earned).toEqual(["peek"]);
    expect(result.current.profile.cards.peek).toBe(1);
    expect(result.current.profile.classic).toHaveLength(1);
  });
  it("awards nothing for a poor game but still records it", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.signIn("Ann"); });
    act(() => { result.current.recordClassic(game(MED, 30, 10)); });
    expect(result.current.profile.cards.autoMatch).toBe(0);
    expect(result.current.profile.classic).toHaveLength(1);
  });
  it("spends a card, and refuses when there are none", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.signIn("Ann"); });
    let ok;
    act(() => { ok = result.current.spendCard("peek"); });
    expect(ok).toBe(false);
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    act(() => { ok = result.current.spendCard("peek"); });
    expect(ok).toBe(true);
    expect(result.current.profile.cards.peek).toBe(0);
  });
  it("keeps only the latest 50 history entries", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.signIn("Ann"); });
    for (let i = 0; i < 55; i++) {
      act(() => { result.current.recordTimer({ won: false, remaining: 0, found: i, loadout: [], used: [] }); });
    }
    expect(result.current.profile.timer).toHaveLength(50);
    expect(result.current.profile.timer[0].found).toBe(54);
  });
  it("keeps separate progress per player", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.signIn("Ann"); });
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    act(() => { result.current.signIn("Bob"); });
    expect(result.current.profile.cards.peek).toBe(0);
    act(() => { result.current.signIn("Ann"); });
    expect(result.current.profile.cards.peek).toBe(1);
  });
  it("sign out clears the active player but keeps data", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.signIn("Ann"); });
    act(() => result.current.signOut());
    expect(result.current.name).toBe("");
    expect(result.current.names).toContain("Ann");
  });
  it("reset progress empties the profile", () => {
    const { result } = renderHook(() => usePlayer());
    act(() => { result.current.signIn("Ann"); });
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    act(() => result.current.resetProgress());
    expect(result.current.profile.cards.peek).toBe(0);
    expect(result.current.profile.classic).toEqual([]);
  });
  it("imports a valid backup and rejects an invalid one with a message", () => {
    const a = renderHook(() => usePlayer());
    act(() => { a.result.current.signIn("Ann"); });
    act(() => { a.result.current.recordClassic(game(LOW, 5, 0)); });
    const text = a.result.current.exportCurrent();
    localStorage.clear();
    const b = renderHook(() => usePlayer());
    let msg;
    act(() => { msg = b.result.current.importFile(text); });
    expect(msg).toBe("Loaded progress for Ann.");
    expect(b.result.current.profile.cards.peek).toBe(1);
    act(() => { msg = b.result.current.importFile("garbage"); });
    expect(msg).toMatch(/not a Memory Match backup/);
  });
});
