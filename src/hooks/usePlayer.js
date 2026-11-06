import { useState, useRef } from "react";
import { loadStore, saveStore, cleanName, emptyProfile, exportText, parseImport } from "../storage";
import { awardsFor } from "../data/rewards";

const MAX_HISTORY = 50;

const clone = (store) => ({ lastPlayer: store.lastPlayer, players: Object.assign(Object.create(null), store.players) });

export default function usePlayer() {
  const [store, setStore] = useState(loadStore);
  const [saved, setSaved] = useState(true);
  const latest = useRef(store);

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
  };

  const signIn = (value) => {
    const name = cleanName(value);
    if (!name) return false;
    const next = clone(latest.current);
    next.lastPlayer = name;
    if (!next.players[name]) next.players[name] = emptyProfile();
    commit(next);
    return true;
  };

  const signOut = () => commit({ ...clone(latest.current), lastPlayer: "" });

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

  const importFile = (text) => {
    try {
      const { name, profile } = parseImport(text);
      const next = clone(latest.current);
      next.players[name] = profile;
      next.lastPlayer = name;
      commit(next);
      return `Loaded progress for ${name}.`;
    } catch (err) {
      return err.message;
    }
  };

  const name = store.lastPlayer;
  const profile = name ? store.players[name] : null;

  return {
    name,
    profile,
    names: Object.keys(store.players),
    saved,
    signIn,
    signOut,
    recordClassic,
    recordTimer,
    spendCard,
    importFile,
    resetProgress: () => edit(() => emptyProfile()),
    exportCurrent: () => exportText(name, profile),
  };
}
