import { describe, it, expect } from "vitest";
import { awardsFor, cardForLevel, PEEK_UNDER_MOVES, AUTO_MAX_WRONG, FREEZE_MAX_WRONG } from "../data/rewards";
import { pairsFor, LEVELS } from "../data/levels";
import { THEMES, MIXED } from "../data/themes";
import { TIMER_PAIRS } from "../data/powerups";

describe("reward rules", () => {
  it("Low: awards Peek only under the move limit (boundary)", () => {
    expect(awardsFor({ levelId: "low", moves: PEEK_UNDER_MOVES - 1, wrong: 0 })).toEqual(["peek"]);
    expect(awardsFor({ levelId: "low", moves: PEEK_UNDER_MOVES, wrong: 0 })).toEqual([]);
  });
  it("Medium: awards Auto-Match at or below the wrong-flip limit (boundary)", () => {
    expect(awardsFor({ levelId: "medium", moves: 20, wrong: AUTO_MAX_WRONG })).toEqual(["autoMatch"]);
    expect(awardsFor({ levelId: "medium", moves: 20, wrong: AUTO_MAX_WRONG + 1 })).toEqual([]);
  });
  it("High: awards Freeze at or below the wrong-flip limit (boundary)", () => {
    expect(awardsFor({ levelId: "high", moves: 30, wrong: FREEZE_MAX_WRONG })).toEqual(["freeze"]);
    expect(awardsFor({ levelId: "high", moves: 30, wrong: FREEZE_MAX_WRONG + 1 })).toEqual([]);
  });
  it("unknown level awards nothing and has no card", () => {
    expect(awardsFor({ levelId: "nope", moves: 0, wrong: 0 })).toEqual([]);
    expect(cardForLevel("nope")).toBeUndefined();
  });
  it("maps each level to its card", () => {
    expect(["low", "medium", "high"].map(cardForLevel)).toEqual(["peek", "autoMatch", "freeze"]);
  });
});

describe("game data integrity", () => {
  it("every theme has enough distinct cards for the hardest level", () => {
    const hardest = Math.max(...LEVELS.map((l) => l.pairs));
    for (const t of THEMES) {
      expect(new Set(t.items.map((i) => i.label)).size).toBe(t.items.length);
      expect(t.items.length).toBeGreaterThanOrEqual(hardest);
    }
  });
  it("pairsFor never exceeds available items", () => {
    expect(pairsFor({ items: [1, 2, 3] }, { pairs: 9 })).toBe(3);
    expect(pairsFor({ items: new Array(9) }, { pairs: 4 })).toBe(4);
  });
  it("Mixed theme supports the timer mode pair count", () => {
    expect(MIXED.items.length).toBeGreaterThanOrEqual(TIMER_PAIRS);
  });
});
