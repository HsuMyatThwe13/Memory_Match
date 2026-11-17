import { describe, it, expect, beforeEach, vi } from "vitest";
import { cleanName, cleanProfile, emptyProfile, loadStore, saveStore, exportText, parseImport } from "../storage";

beforeEach(() => localStorage.clear());

describe("cleanName (input validation)", () => {
  it("strips symbols and markup", () => expect(cleanName("<b>Ann</b>")).toBe("bAnnb"));
  it("collapses whitespace and trims", () => expect(cleanName("  Mo   Mo ")).toBe("Mo Mo"));
  it("limits to 12 characters", () => expect(cleanName("abcdefghijklmnop")).toHaveLength(12));
  it("keeps unicode letters", () => expect(cleanName("မြန်မာ")).not.toBe(""));
  it("returns empty for null, undefined and symbol-only input", () => {
    expect(cleanName(null)).toBe("");
    expect(cleanName(undefined)).toBe("");
    expect(cleanName("!!!@@@")).toBe("");
  });
});

describe("cleanProfile (corrupt data defence)", () => {
  it("returns an empty profile for garbage", () => {
    expect(cleanProfile(null)).toEqual(emptyProfile());
    expect(cleanProfile("x")).toEqual(emptyProfile());
  });
  it("clamps negative, NaN and huge card counts", () => {
    const p = cleanProfile({ cards: { peek: -5, autoMatch: "abc", freeze: 99999 } });
    expect(p.cards).toEqual({ peek: 0, autoMatch: 0, freeze: 999 });
  });
  it("caps history at 50 entries", () => {
    const p = cleanProfile({ classic: new Array(80).fill({}), timer: new Array(80).fill({}) });
    expect(p.classic).toHaveLength(50);
    expect(p.timer).toHaveLength(50);
  });
  it("drops unknown card ids from earned/used lists", () => {
    const p = cleanProfile({ classic: [{ earned: ["peek", "hack"] }], timer: [{ used: ["freeze", "x"], loadout: ["bad"] }] });
    expect(p.classic[0].earned).toEqual(["peek"]);
    expect(p.timer[0].used).toEqual(["freeze"]);
    expect(p.timer[0].loadout).toEqual([]);
  });
  it("only treats won === true as a win", () => {
    expect(cleanProfile({ timer: [{ won: "true" }] }).timer[0].won).toBe(false);
  });
});

describe("loadStore / saveStore", () => {
  it("starts empty when nothing is saved", () => {
    expect(loadStore().lastPlayer).toBe("");
    expect(Object.keys(loadStore().players)).toHaveLength(0);
  });
  it("round-trips a saved player", () => {
    const store = loadStore();
    store.players.Ann = emptyProfile();
    store.lastPlayer = "Ann";
    expect(saveStore(store)).toBe(true);
    expect(loadStore().lastPlayer).toBe("Ann");
  });
  it("survives broken JSON in localStorage", () => {
    localStorage.setItem("memorymatch:v1", "{not json");
    expect(loadStore().lastPlayer).toBe("");
  });
  it("ignores prototype-pollution style keys", () => {
    localStorage.setItem("memorymatch:v1", JSON.stringify({ players: { __proto__: {}, "<x>": {} }, lastPlayer: "__proto__" }));
    const s = loadStore();
    expect(Object.keys(s.players)).toEqual([]);
    expect(s.lastPlayer).toBe("");
  });
  it("reports failure when storage is full or blocked", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => { throw new Error("quota"); });
    expect(saveStore(loadStore())).toBe(false);
  });
});

describe("backup export / import", () => {
  it("round-trips through export and import", () => {
    const { name, profile } = parseImport(exportText("Ann", emptyProfile()));
    expect(name).toBe("Ann");
    expect(profile).toEqual(emptyProfile());
  });
  it.each([
    ["not json", "{{{"],
    ["wrong app", JSON.stringify({ app: "other", player: "A", profile: {} })],
    ["missing player", JSON.stringify({ app: "memorymatch", profile: {} })],
    ["missing profile", JSON.stringify({ app: "memorymatch", player: "A" })],
    ["too big", "x".repeat(200001)],
    ["non-string", 42],
  ])("rejects invalid backup: %s", (_label, text) => {
    expect(() => parseImport(text)).toThrow();
  });
});
