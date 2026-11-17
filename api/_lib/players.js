import { scryptSync, randomBytes, timingSafeEqual } from "node:crypto";
import { cleanName, cleanProfile, emptyProfile } from "../../src/storage.js";

export const MAX_FAILS = 8;
export const LOCK_SECONDS = 15 * 60;
export const PIN_PATTERN = /^\d{4}$/;

const BAD_LOGIN = "Wrong PIN for this nickname.";

const keyFor = (name) => `player:${name}`; // case sensitive: "ann" and "Ann" are different players
const failKeyFor = (name) => `fails:${name}`;

const hashPin = (pin, salt) => scryptSync(pin, salt, 32).toString("hex");

function pinMatches(record, pin) {
  const expected = Buffer.from(record.hash, "hex");
  const actual = Buffer.from(hashPin(pin, record.salt), "hex");
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

const reply = (status, body) => ({ status, body });

function readCredentials(body) {
  const name = cleanName(body?.name);
  const pin = typeof body?.pin === "string" ? body.pin : "";
  if (!name) return { error: reply(400, { error: "Enter a nickname." }) };
  if (!PIN_PATTERN.test(pin)) return { error: reply(400, { error: "The PIN must be 4 digits." }) };
  return { name, pin };
}

// Checks the PIN for an existing player and counts wrong tries.
async function authenticate(store, record, name, pin) {
  const failKey = failKeyFor(name);
  if ((Number(await store.get(failKey)) || 0) >= MAX_FAILS) {
    return reply(429, { error: "Too many wrong PINs. Try again in 15 minutes." });
  }
  if (!pinMatches(record, pin)) {
    const fails = await store.increment(failKey);
    if (fails === 1) await store.expire(failKey, LOCK_SECONDS);
    return reply(401, { error: BAD_LOGIN });
  }
  await store.remove(failKey);
  return null;
}

// Step 1 of signing in: does this nickname already have an account? (Tells the form whether to ask for a PIN or to create one.)
export async function check(store, body) {
  const name = cleanName(body?.name);
  if (!name) return reply(400, { error: "Enter a nickname." });
  return reply(200, { name, exists: (await store.get(keyFor(name))) !== null });
}

export async function login(store, body) {
  const { name, pin, error } = readCredentials(body);
  if (error) return error;

  let record = await store.get(keyFor(name));
  // "existing" means open only: a refresh of a signed-in page must never create an account
  if (!record && body.existing === true) return reply(404, { error: "That player does not exist." });
  if (!record) {
    const salt = randomBytes(16).toString("hex");
    const fresh = { name, salt, hash: hashPin(pin, salt), profile: emptyProfile(), updatedAt: Date.now() };
    if (await store.setIfAbsent(keyFor(name), fresh)) {
      return reply(200, { name, profile: fresh.profile, created: true });
    }
    record = await store.get(keyFor(name)); // someone claimed it a moment earlier
  }

  const denied = await authenticate(store, record, name, pin);
  if (denied) return denied;
  return reply(200, { name: record.name, profile: cleanProfile(record.profile), created: false });
}

export async function save(store, body) {
  const { name, pin, error } = readCredentials(body);
  if (error) return error;

  const record = await store.get(keyFor(name));
  if (!record) return reply(404, { error: "That player does not exist." });

  const denied = await authenticate(store, record, name, pin);
  if (denied) return denied;

  await store.set(keyFor(name), { ...record, profile: cleanProfile(body.profile), updatedAt: Date.now() });
  return reply(200, { ok: true });
}

// Permanently removes an account (needs the right PIN). The nickname can be claimed again afterwards.
export async function removeAccount(store, body) {
  const { name, pin, error } = readCredentials(body);
  if (error) return error;

  const record = await store.get(keyFor(name));
  if (!record) return reply(404, { error: "That player does not exist." });

  const denied = await authenticate(store, record, name, pin);
  if (denied) return denied;

  await store.remove(keyFor(name));
  await store.remove(failKeyFor(name));
  return reply(200, { ok: true });
}

const ACTIONS = { check, login, save, delete: removeAccount };

// One entry point for every API call, so the Vercel functions and the dev server behave the same.
export async function run(action, method, body, store) {
  if (!ACTIONS[action]) return reply(404, { error: "Not found." });
  if (method !== "POST") return reply(405, { error: "Use POST." });
  try {
    return await ACTIONS[action](store, body);
  } catch {
    return reply(500, { error: "The server could not complete that. Please try again." });
  }
}
