const KEY = "memorymatch:v1";
const MAX_HISTORY = 50;
const MAX_FILE = 200000;

export const CARD_IDS = ["peek", "autoMatch", "freeze"];

export const cleanName = (value) =>
  String(value ?? "")
    .replace(/[^\p{L}\p{N} _-]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 12);

const num = (v, max = 1e9) => Math.min(max, Math.max(0, Math.floor(Number(v) || 0)));
const str = (v, max = 24) => String(v ?? "").slice(0, max);
const ids = (list) => (Array.isArray(list) ? list.filter((id) => CARD_IDS.includes(id)).slice(0, 10) : []);

const cleanClassic = (e) => ({
  ts: num(e?.ts, 8.64e15), theme: str(e?.theme), level: str(e?.level), pairs: num(e?.pairs, 99),
  moves: num(e?.moves, 9999), wrong: num(e?.wrong, 9999), time: num(e?.time, 999999), earned: ids(e?.earned),
});

const cleanTimer = (e) => ({
  ts: num(e?.ts, 8.64e15), won: e?.won === true, remaining: num(e?.remaining, 9999), found: num(e?.found, 99),
  loadout: ids(e?.loadout), used: ids(e?.used),
});

export const emptyProfile = () => ({ cards: { peek: 0, autoMatch: 0, freeze: 0 }, classic: [], timer: [] });

export function cleanProfile(p) {
  const profile = emptyProfile();
  for (const id of CARD_IDS) profile.cards[id] = num(p?.cards?.[id], 999);
  if (Array.isArray(p?.classic)) profile.classic = p.classic.slice(0, MAX_HISTORY).map(cleanClassic);
  if (Array.isArray(p?.timer)) profile.timer = p.timer.slice(0, MAX_HISTORY).map(cleanTimer);
  return profile;
}

export function loadStore() {
  const store = { lastPlayer: "", players: Object.create(null) };
  try {
    const data = JSON.parse(localStorage.getItem(KEY));
    if (data && typeof data.players === "object" && data.players) {
      for (const [key, value] of Object.entries(data.players)) {
        const name = cleanName(key);
        if (name && name === key) store.players[name] = cleanProfile(value);
      }
      const last = cleanName(data.lastPlayer);
      if (last in store.players) store.lastPlayer = last;
    }
  } catch {
    // missing or broken save: start with an empty store
  }
  return store;
}

export function saveStore(store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    return true;
  } catch {
    return false;
  }
}

export const exportText = (name, profile) =>
  JSON.stringify({ app: "memorymatch", version: 1, player: name, profile }, null, 2);

export function parseImport(text) {
  if (typeof text !== "string" || text.length > MAX_FILE) throw new Error("That file is too big.");
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error("That is not a Memory Match backup file.");
  }
  const name = cleanName(data?.player);
  if (data?.app !== "memorymatch" || !name || !data.profile || typeof data.profile !== "object") {
    throw new Error("That is not a Memory Match backup file.");
  }
  return { name, profile: cleanProfile(data.profile) };
}
