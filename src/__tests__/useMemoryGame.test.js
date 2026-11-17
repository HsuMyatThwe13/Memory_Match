import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import useMemoryGame from "../hooks/useMemoryGame";
import { THEMES } from "../data/themes";
import { PEEK_MS, FREEZE_SECONDS } from "../data/powerups";

const theme = THEMES[0];
const setup = (pairs = 4, opts) => renderHook(() => useMemoryGame(theme, pairs, opts));
const tick = (ms) => act(() => { vi.advanceTimersByTime(ms); });

const find = (cards, matchFn) => {
  for (const a of cards) for (const b of cards) if (a.id < b.id && matchFn(a, b)) return [a, b];
};
const pair = (cards) => find(cards, (a, b) => a.label === b.label);
const mismatch = (cards) => find(cards, (a, b) => a.label !== b.label);
const flipBoth = (r, [a, b]) => { act(() => r.current.flip(a)); act(() => r.current.flip(b)); };

beforeEach(() => vi.useFakeTimers());
afterEach(() => vi.useRealTimers());

describe("dealing", () => {
  it("deals pairs*2 cards, each label exactly twice", () => {
    const { result } = setup(6);
    expect(result.current.cards).toHaveLength(12);
    const counts = {};
    result.current.cards.forEach((c) => (counts[c.label] = (counts[c.label] || 0) + 1));
    expect(Object.values(counts).every((n) => n === 2)).toBe(true);
  });
  it("gives every card a unique id equal to its index", () => {
    const { result } = setup(9);
    expect(result.current.cards.map((c) => c.id)).toEqual([...Array(18).keys()]);
  });
});

describe("flipping", () => {
  it("a matching pair counts a move, no wrong flip, and stays matched", () => {
    const { result } = setup();
    flipBoth(result, pair(result.current.cards));
    expect(result.current.moves).toBe(1);
    tick(1000);
    expect(result.current.wrong).toBe(0);
    expect(result.current.matched).toHaveLength(2);
    expect(result.current.score).toBe(1);
  });
  it("a mismatch counts a wrong flip and flips back", () => {
    const { result } = setup();
    flipBoth(result, mismatch(result.current.cards));
    expect(result.current.wrong).toBe(1);
    tick(1000);
    expect(result.current.flipped).toEqual([]);
    expect(result.current.matched).toEqual([]);
  });
  it("ignores a third flip while two cards are open", () => {
    const { result } = setup();
    const [a, b] = mismatch(result.current.cards);
    const third = result.current.cards.find((c) => c.id !== a.id && c.id !== b.id);
    flipBoth(result, [a, b]);
    act(() => result.current.flip(third));
    expect(result.current.flipped).toHaveLength(2);
  });
  it("ignores flipping the same card twice (no self-match)", () => {
    const { result } = setup();
    const c = result.current.cards[0];
    act(() => result.current.flip(c));
    act(() => result.current.flip(c));
    expect(result.current.flipped).toEqual([c.id]);
    expect(result.current.moves).toBe(0);
  });
  it("ignores already matched cards", () => {
    const { result } = setup();
    const [a, b] = pair(result.current.cards);
    flipBoth(result, [a, b]);
    tick(1000);
    act(() => result.current.flip(a));
    expect(result.current.flipped).toEqual([]);
  });
});

describe("win, restart, cheats", () => {
  it("wins when every pair is matched and then blocks flips", () => {
    const { result } = setup(2);
    const cards = result.current.cards;
    const labels = [...new Set(cards.map((c) => c.label))];
    for (const label of labels) {
      flipBoth(result, cards.filter((c) => c.label === label));
      tick(1000);
    }
    expect(result.current.won).toBe(true);
    act(() => result.current.flip(cards[0]));
    expect(result.current.flipped).toEqual([]);
  });
  it("restart resets all counters and redeals", () => {
    const { result } = setup();
    flipBoth(result, mismatch(result.current.cards));
    tick(1000);
    act(() => result.current.restart());
    const g = result.current;
    expect([g.moves, g.wrong, g.time, g.flipped.length, g.matched.length, g.used.length]).toEqual([0, 0, 0, 0, 0, 0]);
    expect(g.started).toBe(false);
    expect(g.cards).toHaveLength(8);
  });
  it("cheatWin wins immediately", () => {
    const { result } = setup();
    act(() => result.current.cheatWin());
    expect(result.current.won).toBe(true);
  });
});

describe("timer mode", () => {
  const SECONDS = 10;
  it("does not run before the first flip", () => {
    const { result } = setup(4, { seconds: SECONDS });
    tick(5000);
    expect(result.current.remaining).toBe(SECONDS);
  });
  it("counts down after the first flip and loses at zero", () => {
    const { result } = setup(4, { seconds: SECONDS });
    act(() => result.current.flip(result.current.cards[0]));
    tick(3000);
    expect(result.current.remaining).toBe(7);
    tick(8000);
    expect(result.current.remaining).toBe(0);
    expect(result.current.lost).toBe(true);
  });
  it("stops counting while paused", () => {
    const { result, rerender } = renderHook(
      ({ paused }) => useMemoryGame(theme, 4, { seconds: SECONDS, paused }),
      { initialProps: { paused: false } },
    );
    act(() => result.current.flip(result.current.cards[0]));
    tick(2000);
    rerender({ paused: true });
    tick(5000);
    expect(result.current.remaining).toBe(8);
  });
  it("never reports lost for a winning board", () => {
    const { result } = setup(4, { seconds: SECONDS });
    act(() => result.current.cheatWin());
    tick(20000);
    expect(result.current.lost).toBe(false);
  });
  it("cheatLose ends the game as lost", () => {
    const { result } = setup(4, { seconds: SECONDS });
    act(() => result.current.cheatLose());
    expect(result.current.lost).toBe(true);
  });
});

describe("power-ups", () => {
  it("Peek reveals cards, blocks flips, then ends", () => {
    const onSpend = vi.fn();
    const { result } = setup(4, { seconds: 60, onSpend });
    act(() => { result.current.use("peek"); });
    expect(result.current.peeking).toBe(true);
    act(() => result.current.flip(result.current.cards[0]));
    expect(result.current.flipped).toEqual([]);
    tick(PEEK_MS + 50);
    expect(result.current.peeking).toBe(false);
    expect(onSpend).toHaveBeenCalledWith("peek");
  });
  it("Auto-Match matches exactly one pair", () => {
    const { result } = setup(4, { seconds: 60 });
    act(() => { result.current.use("autoMatch"); });
    expect(result.current.matched).toHaveLength(2);
    const [a, b] = result.current.matched.map((id) => result.current.cards[id]);
    expect(a.label).toBe(b.label);
  });
  it("Auto-Match completes the pair of an already flipped card", () => {
    const { result } = setup(4, { seconds: 60 });
    const c = result.current.cards[0];
    act(() => result.current.flip(c));
    act(() => { result.current.use("autoMatch"); });
    expect(result.current.matched).toContain(c.id);
    expect(result.current.flipped).toEqual([]);
  });
  it("Freeze pauses the countdown for FREEZE_SECONDS then resumes", () => {
    const { result } = setup(4, { seconds: 60 });
    act(() => result.current.flip(result.current.cards[0]));
    act(() => { result.current.use("freeze"); });
    tick(FREEZE_SECONDS * 1000);
    expect(result.current.remaining).toBe(60);
    tick(2000);
    expect(result.current.remaining).toBe(58);
  });
  it("cannot use Freeze twice at once", () => {
    const { result } = setup(4, { seconds: 60 });
    let first, second;
    act(() => { first = result.current.use("freeze"); });
    act(() => { second = result.current.use("freeze"); });
    expect([first, second]).toEqual([true, false]);
  });
  it("cannot use a power-up after the game is over", () => {
    const { result } = setup(4, { seconds: 60 });
    act(() => result.current.cheatWin());
    let ok;
    act(() => { ok = result.current.use("peek"); });
    expect(ok).toBe(false);
  });
});
