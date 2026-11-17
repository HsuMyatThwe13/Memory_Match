import { describe, it, expect } from "vitest";
import { fitBoard } from "../layout";

const CARD_COUNTS = [8, 12, 18, 40];
const SCREENS = {
  "small phone": [288, 400],
  "phone portrait": [343, 560],
  "phone landscape": [580, 250],
  "iPad portrait": [736, 700],
  "iPad landscape": [984, 560],
  laptop: [1100, 520],
  desktop: [1100, 800],
};

describe("fitBoard (responsive card layout)", () => {
  for (const [name, [w, h]] of Object.entries(SCREENS)) {
    for (const count of CARD_COUNTS) {
      it(`${count} cards fit inside a ${name} (${w}x${h})`, () => {
        const { cols, size, gap } = fitBoard(count, w, h);
        const rows = count / cols;
        expect(Number.isInteger(rows)).toBe(true);
        expect(cols * size + (cols - 1) * gap).toBeLessThanOrEqual(w + 1);
        expect(rows * size + (rows - 1) * gap).toBeLessThanOrEqual(h + 1);
      });
    }
  }

  it("uses fewer columns on a tall narrow screen than on a wide short one", () => {
    expect(fitBoard(40, 343, 560).cols).toBeLessThan(fitBoard(40, 1100, 520).cols);
  });

  it("never makes cards bigger than the maximum", () => {
    expect(fitBoard(8, 3000, 3000).size).toBeLessThanOrEqual(150);
  });

  it("never makes cards smaller than the minimum, even in a tiny space", () => {
    expect(fitBoard(40, 100, 100).size).toBeGreaterThanOrEqual(28);
  });

  it("prefers a grid shaped like the screen when card sizes tie", () => {
    expect(fitBoard(8, 984, 560).cols).toBe(4);
    expect(fitBoard(8, 343, 700).cols).toBe(2);
  });
});
