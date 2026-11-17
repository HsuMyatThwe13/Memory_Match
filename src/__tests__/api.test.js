// @vitest-environment node
import { describe, it, expect, beforeEach } from "vitest";
import { run, check, login, save, removeAccount, MAX_FAILS } from "../../api/_lib/players.js";
import { memoryStore } from "../../api/_lib/store.js";

let store;
beforeEach(() => {
  store = memoryStore();
});

const signUp = (name = "Ann", pin = "1234") => login(store, { name, pin });
const profileWith = (peek) => ({ cards: { peek, autoMatch: 0, freeze: 0 }, classic: [], timer: [] });

describe("login: creating and opening accounts", () => {
  it("creates a new account with an empty profile", async () => {
    const { status, body } = await signUp();
    expect(status).toBe(200);
    expect(body.created).toBe(true);
    expect(body.profile.cards).toEqual({ peek: 0, autoMatch: 0, freeze: 0 });
  });

  it("opens the same account again with the right PIN", async () => {
    await signUp();
    const { status, body } = await signUp();
    expect(status).toBe(200);
    expect(body.created).toBe(false);
  });

  it("does not let another person open a taken nickname with a different PIN", async () => {
    await signUp("Ann", "1234");
    const { status, body } = await signUp("Ann", "9999");
    expect(status).toBe(401);
    expect(body.error).toMatch(/Wrong PIN/);
    expect(body.profile).toBeUndefined();
  });

  it("treats nicknames as case sensitive: ann and Ann are different players", async () => {
    await signUp("Ann", "1234");
    const lower = await signUp("ann", "9999");
    expect(lower.status).toBe(200);
    expect(lower.body.created).toBe(true);
    expect(lower.body.name).toBe("ann");
    // each one opens only with its own PIN
    expect((await signUp("Ann", "9999")).status).toBe(401);
    expect((await signUp("ann", "1234")).status).toBe(401);
    expect((await signUp("Ann", "1234")).status).toBe(200);
    expect((await signUp("ann", "9999")).status).toBe(200);
  });

  it("keeps the progress of ann and Ann apart", async () => {
    await signUp("Ann", "1234");
    await signUp("ann", "5678");
    await save(store, { name: "ann", pin: "5678", profile: profileWith(4) });
    expect((await signUp("Ann", "1234")).body.profile.cards.peek).toBe(0);
    expect((await signUp("ann", "5678")).body.profile.cards.peek).toBe(4);
  });

  it("keeps different nicknames separate", async () => {
    await signUp("Ann", "1234");
    expect((await signUp("Bob", "5678")).body.created).toBe(true);
  });
});

describe("check: does the nickname exist?", () => {
  it("says a new nickname does not exist", async () => {
    expect((await check(store, { name: "Ann" })).body).toEqual({ name: "Ann", exists: false });
  });

  it("says an existing nickname exists", async () => {
    await signUp("Ann", "1234");
    expect((await check(store, { name: "Ann" })).body.exists).toBe(true);
  });

  it("is case sensitive", async () => {
    await signUp("Ann", "1234");
    expect((await check(store, { name: "ann" })).body.exists).toBe(false);
  });

  it("does not create an account by checking", async () => {
    await check(store, { name: "Ann" });
    expect((await check(store, { name: "Ann" })).body.exists).toBe(false);
  });

  it("does not return any profile data", async () => {
    await signUp("Ann", "1234");
    expect(Object.keys((await check(store, { name: "Ann" })).body).sort()).toEqual(["exists", "name"]);
  });

  it.each([[""], ["!!!"], [undefined]])("rejects nickname %j", async (name) => {
    expect((await check(store, { name })).status).toBe(400);
  });
});

describe("login: open-only requests (page refresh)", () => {
  it("never creates an account when existing is true", async () => {
    expect((await login(store, { name: "Ann", pin: "1234", existing: true })).status).toBe(404);
    expect((await check(store, { name: "Ann" })).body.exists).toBe(false);
  });

  it("opens an existing account when existing is true", async () => {
    await signUp("Ann", "1234");
    const { status, body } = await login(store, { name: "Ann", pin: "1234", existing: true });
    expect(status).toBe(200);
    expect(body.created).toBe(false);
  });

  it("still checks the PIN when existing is true", async () => {
    await signUp("Ann", "1234");
    expect((await login(store, { name: "Ann", pin: "0000", existing: true })).status).toBe(401);
  });
});

describe("login: input validation", () => {
  it.each([["12"], ["12345"], ["abcd"], [""], ["12 4"]])("rejects PIN %j", async (pin) => {
    expect((await login(store, { name: "Ann", pin })).status).toBe(400);
  });

  it("rejects a PIN that is not a string", async () => {
    expect((await login(store, { name: "Ann", pin: 1234 })).status).toBe(400);
  });

  it.each([[""], ["!!!"], [undefined], [null]])("rejects nickname %j", async (name) => {
    expect((await login(store, { name, pin: "1234" })).status).toBe(400);
  });

  it("cleans markup out of the nickname", async () => {
    expect((await login(store, { name: "<b>Ann</b>", pin: "1234" })).body.name).toBe("bAnnb");
  });

  it("handles a missing body", async () => {
    expect((await login(store, undefined)).status).toBe(400);
  });
});

describe("PIN storage and guessing protection", () => {
  it("never stores the PIN itself", async () => {
    await signUp("Ann", "4821");
    const record = await store.get("player:Ann");
    expect(JSON.stringify(record)).not.toContain("4821");
    expect(record.hash).toHaveLength(64);
    expect(record.salt).toBeTruthy();
  });

  it("uses a different salt for each account", async () => {
    await signUp("Ann", "1234");
    await signUp("Bob", "1234");
    expect((await store.get("player:Ann")).hash).not.toBe((await store.get("player:Bob")).hash);
  });

  it("locks the account after too many wrong PINs, even for the right PIN", async () => {
    await signUp("Ann", "1234");
    for (let i = 0; i < MAX_FAILS; i++) await signUp("Ann", "0000");
    const { status } = await signUp("Ann", "1234");
    expect(status).toBe(429);
  });

  it("resets the wrong-PIN count after a successful login", async () => {
    await signUp("Ann", "1234");
    for (let i = 0; i < MAX_FAILS - 1; i++) await signUp("Ann", "0000");
    expect((await signUp("Ann", "1234")).status).toBe(200);
    for (let i = 0; i < MAX_FAILS - 1; i++) await signUp("Ann", "0000");
    expect((await signUp("Ann", "1234")).status).toBe(200);
  });
});

describe("save", () => {
  it("saves progress that the next login returns", async () => {
    await signUp();
    expect((await save(store, { name: "Ann", pin: "1234", profile: profileWith(3) })).status).toBe(200);
    expect((await signUp()).body.profile.cards.peek).toBe(3);
  });

  it("shows the same data on a second device with the same nickname and PIN", async () => {
    await signUp();
    await save(store, { name: "Ann", pin: "1234", profile: profileWith(2) });
    const otherDevice = await login(store, { name: "Ann", pin: "1234" });
    expect(otherDevice.body.profile.cards.peek).toBe(2);
  });

  it("refuses to save with a wrong PIN and leaves the data unchanged", async () => {
    await signUp();
    await save(store, { name: "Ann", pin: "1234", profile: profileWith(2) });
    expect((await save(store, { name: "Ann", pin: "9999", profile: profileWith(99) })).status).toBe(401);
    expect((await signUp()).body.profile.cards.peek).toBe(2);
  });

  it("returns 404 for a player that does not exist", async () => {
    expect((await save(store, { name: "Nobody", pin: "1234", profile: profileWith(1) })).status).toBe(404);
  });

  it("sanitises a tampered profile before storing it", async () => {
    await signUp();
    await save(store, {
      name: "Ann", pin: "1234",
      profile: { cards: { peek: 99999, autoMatch: -5, freeze: "x" }, classic: new Array(80).fill({}), timer: [] },
    });
    const { profile } = (await signUp()).body;
    expect(profile.cards).toEqual({ peek: 999, autoMatch: 0, freeze: 0 });
    expect(profile.classic).toHaveLength(50);
  });

  it("does not let one account overwrite another", async () => {
    await signUp("Ann", "1234");
    await signUp("Bob", "5678");
    await save(store, { name: "Bob", pin: "5678", profile: profileWith(5) });
    expect((await signUp("Ann", "1234")).body.profile.cards.peek).toBe(0);
  });
});

describe("delete account", () => {
  it("deletes the account with the right PIN, so the nickname is free again", async () => {
    await signUp("Ann", "1234");
    await save(store, { name: "Ann", pin: "1234", profile: profileWith(3) });
    expect((await removeAccount(store, { name: "Ann", pin: "1234" })).status).toBe(200);
    expect((await check(store, { name: "Ann" })).body.exists).toBe(false);
    // a new person can now claim the nickname with a different PIN and starts empty
    const again = await signUp("Ann", "9999");
    expect(again.body.created).toBe(true);
    expect(again.body.profile.cards.peek).toBe(0);
  });

  it("refuses to delete with a wrong PIN and keeps the data", async () => {
    await signUp("Ann", "1234");
    await save(store, { name: "Ann", pin: "1234", profile: profileWith(3) });
    expect((await removeAccount(store, { name: "Ann", pin: "0000" })).status).toBe(401);
    expect((await signUp("Ann", "1234")).body.profile.cards.peek).toBe(3);
  });

  it("counts wrong PINs when deleting, and locks the account too", async () => {
    await signUp("Ann", "1234");
    for (let i = 0; i < MAX_FAILS; i++) await removeAccount(store, { name: "Ann", pin: "0000" });
    expect((await removeAccount(store, { name: "Ann", pin: "1234" })).status).toBe(429);
    expect((await check(store, { name: "Ann" })).body.exists).toBe(true);
  });

  it("returns 404 for a player that does not exist", async () => {
    expect((await removeAccount(store, { name: "Nobody", pin: "1234" })).status).toBe(404);
  });

  it("only deletes the exact nickname, not one with different letter case", async () => {
    await signUp("Ann", "1234");
    await signUp("ann", "1234");
    await removeAccount(store, { name: "Ann", pin: "1234" });
    expect((await check(store, { name: "Ann" })).body.exists).toBe(false);
    expect((await check(store, { name: "ann" })).body.exists).toBe(true);
  });

  it("rejects an invalid PIN", async () => {
    expect((await removeAccount(store, { name: "Ann", pin: "12" })).status).toBe(400);
  });

  it("is reachable as the delete action and only with POST", async () => {
    await signUp("Ann", "1234");
    expect((await run("delete", "GET", { name: "Ann", pin: "1234" }, store)).status).toBe(405);
    expect((await run("delete", "POST", { name: "Ann", pin: "1234" }, store)).status).toBe(200);
  });
});

describe("run (request routing)", () => {
  it("only accepts POST", async () => {
    expect((await run("login", "GET", {}, store)).status).toBe(405);
  });
  it("returns 404 for an unknown action", async () => {
    expect((await run("explode", "POST", {}, store)).status).toBe(404);
  });
  it("returns 500 instead of crashing when the store fails", async () => {
    const broken = { get: async () => { throw new Error("db down"); } };
    const { status, body } = await run("login", "POST", { name: "Ann", pin: "1234" }, broken);
    expect(status).toBe(500);
    expect(body.error).not.toMatch(/db down/);
  });
});
