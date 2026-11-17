import { describe, it, expect } from "vitest";
import { fmt, shuffle } from "../utils";

describe("fmt (timer display)", () => {
  it.each([[0, "00:00"], [5, "00:05"], [59, "00:59"], [60, "01:00"], [240, "04:00"], [3599, "59:59"]])(
    "formats %i seconds as %s", (s, out) => expect(fmt(s)).toBe(out));
});

describe("shuffle", () => {
  it("keeps every item exactly once", () => {
    const list = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    expect([...shuffle(list)].sort()).toEqual(list);
  });
  it("does not mutate the input", () => {
    const list = [1, 2, 3, 4];
    shuffle(list);
    expect(list).toEqual([1, 2, 3, 4]);
  });
  it("handles an empty list", () => expect(shuffle([])).toEqual([]));
});
