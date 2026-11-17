import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import usePlayer, { NETWORK_ERROR } from "../hooks/usePlayer";
import { apiCheck, apiLogin, apiSave, apiDelete } from "../api";
import { run } from "../../api/_lib/players.js";
import { memoryStore } from "../../api/_lib/store.js";

// The browser code talks to a fake network that runs the real server code on an in-memory database.
vi.mock("../api", () => ({ apiCheck: vi.fn(), apiLogin: vi.fn(), apiSave: vi.fn(), apiDelete: vi.fn() }));

const LOW = { id: "low" };
const MED = { id: "medium" };
const game = (level, moves, wrong) => ({ theme: { id: "animals" }, level, pairs: 4, moves, wrong, time: 20 });
const settle = () => act(async () => { await new Promise((r) => setTimeout(r, 0)); });

let server;
beforeEach(() => {
  localStorage.clear();
  sessionStorage.clear();
  server = memoryStore();
  const respond = ({ status, body }) => ({ ok: status < 400, status, data: body });
  apiDelete.mockImplementation(async (name, pin) => respond(await run("delete", "POST", { name, pin }, server)));
  apiCheck.mockImplementation(async (name) => respond(await run("check", "POST", { name }, server)));
  apiLogin.mockImplementation(async (name, pin, existing) => respond(await run("login", "POST", { name, pin, existing }, server)));
  apiSave.mockImplementation(async (name, pin, profile) => respond(await run("save", "POST", { name, pin, profile }, server)));
});

const signIn = async (result, name = "Ann", pin = "1234") => {
  let out;
  await act(async () => { out = await result.current.signIn(name, pin); });
  return out;
};

describe("step 1: checking the nickname", () => {
  const check = async (result, name) => {
    let out;
    await act(async () => { out = await result.current.checkName(name); });
    return out;
  };

  it("says a new nickname does not exist yet", async () => {
    const { result } = renderHook(() => usePlayer());
    expect(await check(result, "Ann")).toEqual({ ok: true, name: "Ann", exists: false });
  });

  it("says an existing nickname exists, and does not sign in", async () => {
    const first = renderHook(() => usePlayer());
    await signIn(first.result);
    sessionStorage.clear();
    const second = renderHook(() => usePlayer());
    expect(await check(second.result, "Ann")).toEqual({ ok: true, name: "Ann", exists: true });
    expect(second.result.current.name).toBe("");
  });

  it("is case sensitive", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result, "Ann", "1234");
    expect((await check(result, "ann")).exists).toBe(false);
  });

  it("rejects an empty nickname without calling the server", async () => {
    const { result } = renderHook(() => usePlayer());
    expect((await check(result, "  !! ")).ok).toBe(false);
    expect(apiCheck).not.toHaveBeenCalled();
  });

  it("shows a clear message when the server cannot be reached", async () => {
    apiCheck.mockResolvedValueOnce({ ok: false, network: true });
    const { result } = renderHook(() => usePlayer());
    expect((await check(result, "Ann")).error).toBe(NETWORK_ERROR);
  });
});

describe("signing in", () => {
  it("rejects an empty or symbol-only nickname without calling the server", async () => {
    const { result } = renderHook(() => usePlayer());
    expect((await signIn(result, "  !!  ")).ok).toBe(false);
    expect(apiLogin).not.toHaveBeenCalled();
    expect(result.current.name).toBe("");
  });

  it("rejects a PIN that is not 4 digits without calling the server", async () => {
    const { result } = renderHook(() => usePlayer());
    expect((await signIn(result, "Ann", "12")).error).toMatch(/4 digits/);
    expect((await signIn(result, "Ann", "abcd")).ok).toBe(false);
    expect(apiLogin).not.toHaveBeenCalled();
  });

  it("creates a new account and signs in", async () => {
    const { result } = renderHook(() => usePlayer());
    const out = await signIn(result);
    expect(out).toEqual({ ok: true, created: true });
    expect(result.current.name).toBe("Ann");
    expect(result.current.profile.cards).toEqual({ peek: 0, autoMatch: 0, freeze: 0 });
  });

  it("refuses a taken nickname with the wrong PIN and stays signed out", async () => {
    const first = renderHook(() => usePlayer());
    await signIn(first.result, "Ann", "1234");
    sessionStorage.clear();
    const second = renderHook(() => usePlayer());
    const out = await signIn(second.result, "Ann", "9999");
    expect(out.ok).toBe(false);
    expect(out.error).toMatch(/Wrong PIN/);
    expect(second.result.current.name).toBe("");
  });

  it("shows a clear message when the server cannot be reached", async () => {
    apiLogin.mockResolvedValueOnce({ ok: false, network: true });
    const { result } = renderHook(() => usePlayer());
    expect((await signIn(result)).error).toBe(NETWORK_ERROR);
    expect(result.current.name).toBe("");
  });

  it("treats ann and Ann as different players", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result, "Ann", "1234");
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    await settle();
    await act(async () => result.current.signOut());

    const lower = await signIn(result, "ann", "1234");
    expect(lower.created).toBe(true);
    expect(result.current.name).toBe("ann");
    expect(result.current.profile.cards.peek).toBe(0);
    await act(async () => result.current.signOut());

    await signIn(result, "Ann", "1234");
    expect(result.current.profile.cards.peek).toBe(1);
  });
});

describe("data follows the nickname across devices", () => {
  it("restores progress on a device with empty storage", async () => {
    const laptop = renderHook(() => usePlayer());
    await signIn(laptop.result);
    act(() => { laptop.result.current.recordClassic(game(LOW, 5, 0)); });
    await settle();

    localStorage.clear();
    sessionStorage.clear();
    const ipad = renderHook(() => usePlayer());
    expect(ipad.result.current.name).toBe("");
    await signIn(ipad.result);
    expect(ipad.result.current.profile.cards.peek).toBe(1);
    expect(ipad.result.current.profile.classic).toHaveLength(1);
  });

  it("sends every change to the server", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result);
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    await waitFor(() => expect(apiSave).toHaveBeenCalled());
    const [name, pin, profile] = apiSave.mock.calls.at(-1);
    expect([name, pin, profile.cards.peek]).toEqual(["Ann", "1234", 1]);
  });

  it("marks progress as not saved when the server is unreachable, and recovers on the next save", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result);
    apiSave.mockResolvedValueOnce({ ok: false, network: true });
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    await waitFor(() => expect(result.current.saved).toBe(false));
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    await waitFor(() => expect(result.current.saved).toBe(true));
    expect(result.current.profile.cards.peek).toBe(2);
  });
});

describe("playing", () => {
  const start = async () => {
    const hook = renderHook(() => usePlayer());
    await signIn(hook.result);
    return hook;
  };

  it("awards a card for a qualifying win and records history", async () => {
    const { result } = await start();
    let earned;
    act(() => { earned = result.current.recordClassic(game(LOW, 5, 0)); });
    expect(earned).toEqual(["peek"]);
    expect(result.current.profile.cards.peek).toBe(1);
    expect(result.current.profile.classic).toHaveLength(1);
  });

  it("awards nothing for a poor game but still records it", async () => {
    const { result } = await start();
    act(() => { result.current.recordClassic(game(MED, 30, 10)); });
    expect(result.current.profile.cards.autoMatch).toBe(0);
    expect(result.current.profile.classic).toHaveLength(1);
  });

  it("spends a card, and refuses when there are none", async () => {
    const { result } = await start();
    let ok;
    act(() => { ok = result.current.spendCard("peek"); });
    expect(ok).toBe(false);
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    act(() => { ok = result.current.spendCard("peek"); });
    expect(ok).toBe(true);
    expect(result.current.profile.cards.peek).toBe(0);
  });

  it("keeps only the latest 50 history entries", async () => {
    const { result } = await start();
    for (let i = 0; i < 55; i++) {
      act(() => { result.current.recordTimer({ won: false, remaining: 0, found: i, loadout: [], used: [] }); });
    }
    expect(result.current.profile.timer).toHaveLength(50);
    expect(result.current.profile.timer[0].found).toBe(54);
  });

  it("reset progress empties the profile", async () => {
    const { result } = await start();
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    act(() => result.current.resetProgress());
    expect(result.current.profile.cards.peek).toBe(0);
    expect(result.current.profile.classic).toEqual([]);
  });
});

describe("deleting an account", () => {
  const remove = async (result) => {
    let out;
    await act(async () => { out = await result.current.deleteAccount(); });
    return out;
  };

  it("deletes the account, signs out and forgets it on this device", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result);
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    await settle();
    expect(await remove(result)).toEqual({ ok: true });
    expect(result.current.name).toBe("");
    expect(result.current.names).not.toContain("Ann");
    expect(sessionStorage.getItem("memorymatch:pin")).toBeNull();
    expect(JSON.parse(localStorage.getItem("memorymatch:v1")).players.Ann).toBeUndefined();
  });

  it("removes the account from the server so the nickname can be used again", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result, "Ann", "1234");
    await remove(result);
    const fresh = await signIn(result, "Ann", "9999");
    expect(fresh.created).toBe(true);
    expect(result.current.profile.cards.peek).toBe(0);
    expect(result.current.profile.classic).toEqual([]);
  });

  it("keeps the account and shows a message when the server cannot be reached", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result);
    apiDelete.mockResolvedValueOnce({ ok: false, network: true });
    const out = await remove(result);
    expect(out).toEqual({ ok: false, error: NETWORK_ERROR });
    expect(result.current.name).toBe("Ann");
  });

  it("does nothing when nobody is signed in", async () => {
    const { result } = renderHook(() => usePlayer());
    expect((await remove(result)).ok).toBe(false);
    expect(apiDelete).not.toHaveBeenCalled();
  });

  it("does not touch other accounts", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result, "Bob", "5678");
    await act(async () => result.current.signOut());
    await signIn(result, "Ann", "1234");
    await remove(result);
    await signIn(result, "Bob", "5678");
    expect(result.current.name).toBe("Bob");
  });
});

describe("accounts on one device", () => {
  it("keeps separate progress per player", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result, "Ann", "1234");
    act(() => { result.current.recordClassic(game(LOW, 5, 0)); });
    await settle();
    await signIn(result, "Bob", "5678");
    expect(result.current.profile.cards.peek).toBe(0);
    await signIn(result, "Ann", "1234");
    expect(result.current.profile.cards.peek).toBe(1);
  });

  it("sign out clears the active player and the PIN but keeps the nickname on the list", async () => {
    const { result } = renderHook(() => usePlayer());
    await signIn(result);
    act(() => result.current.signOut());
    expect(result.current.name).toBe("");
    expect(result.current.names).toContain("Ann");
    expect(sessionStorage.getItem("memorymatch:pin")).toBeNull();
  });

  it("stays signed in after a reload in the same tab", async () => {
    const first = renderHook(() => usePlayer());
    await signIn(first.result);
    await settle();
    const second = renderHook(() => usePlayer());
    expect(second.result.current.name).toBe("Ann");
  });

  it("signs out after a reload if the account no longer exists, and does not create it", async () => {
    const first = renderHook(() => usePlayer());
    await signIn(first.result);
    await settle();
    server = memoryStore(); // the account disappeared on the server
    apiLogin.mockImplementation(async (name, pin, existing) => ({ ...(({ status, body }) => ({ ok: status < 400, status, data: body }))(await run("login", "POST", { name, pin, existing }, server)) }));
    const second = renderHook(() => usePlayer());
    await waitFor(() => expect(second.result.current.name).toBe(""));
    expect(sessionStorage.getItem("memorymatch:pin")).toBeNull();
    expect((await run("check", "POST", { name: "Ann" }, server)).body.exists).toBe(false);
  });

  it("refreshes the data after a reload when another device has played", async () => {
    const laptop = renderHook(() => usePlayer());
    await signIn(laptop.result);
    await settle();
    // another device plays and saves to the server
    await run("save", "POST", { name: "Ann", pin: "1234", profile: { cards: { peek: 7, autoMatch: 0, freeze: 0 }, classic: [], timer: [] } }, server);
    const reloaded = renderHook(() => usePlayer());
    await waitFor(() => expect(reloaded.result.current.profile.cards.peek).toBe(7));
  });

  it("signs out when the tab session is gone", async () => {
    const first = renderHook(() => usePlayer());
    await signIn(first.result);
    sessionStorage.clear();
    const second = renderHook(() => usePlayer());
    expect(second.result.current.name).toBe("");
  });
});
