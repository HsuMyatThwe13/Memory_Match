import { useState, useRef, useEffect } from "react";
import { loadStore, saveStore, cleanName, cleanProfile, emptyProfile } from "../storage";
import { awardsFor } from "../data/rewards";
import { apiCheck, apiLogin, apiSave, apiDelete } from "../api";

const MAX_HISTORY = 50;
const PIN_KEY = "memorymatch:pin";
export const NETWORK_ERROR = "Cannot reach the server. Check your internet connection and try again.";
const GENERIC_ERROR = "Something went wrong. Please try again.";

const clone = (store) => ({ lastPlayer: store.lastPlayer, players: Object.assign(Object.create(null), store.players) });

// The PIN is kept only for this browser tab (sessionStorage), so closing the tab signs you out.
const readPin = () => {
  try {
    return sessionStorage.getItem(PIN_KEY) || "";
  } catch {
    return "";
  }
};
const writePin = (pin) => {
  try {
    if (pin) sessionStorage.setItem(PIN_KEY, pin);
    else sessionStorage.removeItem(PIN_KEY);
  } catch {
    // storage blocked: the player will sign in again after a reload
  }
};

export default function usePlayer() {
  const [store, setStore] = useState(loadStore);
  const [saved, setSaved] = useState(true);
  const latest = useRef(store);
  const pin = useRef(readPin());
  const syncing = useRef(false);
  const again = useRef(false);

  // Sends the newest copy of the profile to the server. If a save is already running, it runs once more afterwards.
  const sync = async () => {
    if (syncing.current) {
      again.current = true;
      return;
    }
    syncing.current = true;
    try {
      do {
        again.current = false;
        const name = latest.current.lastPlayer;
        const profile = latest.current.players[name];
        if (!name || !pin.current || !profile) break;
        const result = await apiSave(name, pin.current, profile);
        setSaved(result.ok);
      } while (again.current);
    } finally {
      syncing.current = false;
    }
  };

  const commit = (next) => {
    latest.current = next;
    setStore(next);
    setSaved(saveStore(next));
  };

  const edit = (change) => {
    const name = latest.current.lastPlayer;
    if (!name) return;
    const next = clone(latest.current);
    next.players[name] = change(latest.current.players[name]);
    commit(next);
    sync();
  };

  const signIn = async (rawName, rawPin) => {
    const name = cleanName(rawName);
    if (!name) return { ok: false, error: "Enter a nickname." };
    if (!/^\d{4}$/.test(rawPin ?? "")) return { ok: false, error: "The PIN must be 4 digits." };

    const result = await apiLogin(name, rawPin);
    if (!result.ok) return { ok: false, error: result.network ? NETWORK_ERROR : result.data?.error || GENERIC_ERROR };

    const account = cleanName(result.data?.name) || name;
    pin.current = rawPin;
    writePin(rawPin);
    const next = clone(latest.current);
    next.lastPlayer = account;
    next.players[account] = cleanProfile(result.data?.profile);
    commit(next);
    return { ok: true, created: result.data?.created === true };
  };

  // After a page reload inside a signed-in tab, pull the newest copy from the server (another device may have played).
  useEffect(() => {
    const account = latest.current.lastPlayer;
    if (!account || !pin.current) return;
    let cancelled = false;
    apiLogin(account, pin.current, true).then((result) => {
      if (cancelled) return;
      if (result.status === 401 || result.status === 404) {
        // the account or its PIN no longer matches: sign out instead of showing stale data
        pin.current = "";
        writePin("");
        commit({ ...clone(latest.current), lastPlayer: "" });
        return;
      }
      if (!result.ok) return;
      const next = clone(latest.current);
      next.players[account] = cleanProfile(result.data?.profile);
      commit(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = () => {
    pin.current = "";
    writePin("");
    commit({ ...clone(latest.current), lastPlayer: "" });
  };

  const recordClassic = ({ theme, level, pairs, moves, wrong, time }) => {
    const earned = awardsFor({ levelId: level.id, moves, wrong });
    edit((p) => {
      const cards = { ...p.cards };
      for (const id of earned) cards[id] = Math.min(999, cards[id] + 1);
      const entry = { ts: Date.now(), theme: theme.id, level: level.id, pairs, moves, wrong, time, earned };
      return { ...p, cards, classic: [entry, ...p.classic].slice(0, MAX_HISTORY) };
    });
    return earned;
  };

  const recordTimer = ({ won, remaining, found, loadout, used }) =>
    edit((p) => ({ ...p, timer: [{ ts: Date.now(), won, remaining, found, loadout, used }, ...p.timer].slice(0, MAX_HISTORY) }));

  const spendCard = (id) => {
    const profile = latest.current.players[latest.current.lastPlayer];
    if (!profile || !(profile.cards[id] > 0)) return false;
    edit((p) => ({ ...p, cards: { ...p.cards, [id]: p.cards[id] - 1 } }));
    return true;
  };

  // Permanently deletes the signed-in account on the server, then removes it from this device too.
  const deleteAccount = async () => {
    const account = latest.current.lastPlayer;
    if (!account || !pin.current) return { ok: false, error: "Sign in first." };
    const result = await apiDelete(account, pin.current);
    if (!result.ok && result.status !== 404) {
      return { ok: false, error: result.network ? NETWORK_ERROR : result.data?.error || GENERIC_ERROR };
    }
    pin.current = "";
    writePin("");
    const next = clone(latest.current);
    delete next.players[account];
    next.lastPlayer = "";
    commit(next);
    return { ok: true };
  };

  // Step 1 of signing in: does this nickname already exist? (so the form knows whether to ask for a PIN or to create one)
  const checkName = async (rawName) => {
    const name = cleanName(rawName);
    if (!name) return { ok: false, error: "Enter a nickname." };
    const result = await apiCheck(name);
    if (!result.ok) return { ok: false, error: result.network ? NETWORK_ERROR : result.data?.error || GENERIC_ERROR };
    return { ok: true, name: result.data?.name || name, exists: result.data?.exists === true };
  };

  const name = pin.current ? store.lastPlayer : "";
  const profile = name ? store.players[name] : null;

  return {
    name,
    profile,
    names: Object.keys(store.players),
    saved,
    checkName,
    deleteAccount,
    signIn,
    signOut,
    recordClassic,
    recordTimer,
    spendCard,
    resetProgress: () => edit(() => emptyProfile()),
  };
}
