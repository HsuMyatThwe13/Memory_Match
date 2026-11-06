import { useState, useEffect, useRef } from "react";
import { shuffle } from "../utils";
import { PEEK_MS, FREEZE_SECONDS } from "../data/powerups";

const deal = (theme, pairs) =>
  shuffle(shuffle(theme.items).slice(0, pairs).flatMap((item) => [item, item])).map((item, id) => ({ ...item, id }));

export default function useMemoryGame(theme, pairs, { seconds = 0, onSpend } = {}) {
  const [cards, setCards] = useState(() => deal(theme, pairs));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const [peeking, setPeeking] = useState(false);
  const [freezeLeft, setFreezeLeft] = useState(0);
  const [used, setUsed] = useState([]);
  const pending = useRef(null);
  const peekTimer = useRef(null);

  const won = matched.length === cards.length;
  const remaining = seconds ? Math.max(0, seconds - time) : 0;
  const lost = seconds > 0 && !won && remaining === 0;
  const over = won || lost;
  const frozen = freezeLeft > 0;
  const [matchDelay, missDelay] = seconds ? [400, 700] : [500, 900];

  useEffect(() => {
    if (!started || over) return;
    const t = setInterval(() => (frozen ? setFreezeLeft((f) => Math.max(0, f - 1)) : setTime((s) => s + 1)), 1000);
    return () => clearInterval(t);
  }, [started, over, frozen]);

  useEffect(() => () => {
    clearTimeout(pending.current);
    clearTimeout(peekTimer.current);
  }, []);

  const flip = (card) => {
    if (over || peeking || flipped.length >= 2 || flipped.includes(card.id) || matched.includes(card.id)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    setStarted(true);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const isMatch = cards[next[0]].label === cards[next[1]].label;
    if (!isMatch) setWrong((w) => w + 1);
    pending.current = setTimeout(() => {
      if (isMatch) setMatched((m) => [...m, ...next]);
      setFlipped([]);
    }, isMatch ? matchDelay : missDelay);
  };

  const canUse = {
    peek: !over && !peeking && flipped.length < 2,
    autoMatch: !over && !peeking && flipped.length < 2,
    freeze: !over && !frozen,
  };

  const use = (id) => {
    if (!canUse[id]) return false;
    setStarted(true);
    if (id === "peek") {
      setPeeking(true);
      peekTimer.current = setTimeout(() => setPeeking(false), PEEK_MS);
    } else if (id === "freeze") {
      setFreezeLeft(FREEZE_SECONDS);
    } else {
      const open = cards.filter((c) => !matched.includes(c.id));
      const label = flipped.length === 1 ? cards[flipped[0]].label : open[Math.floor(Math.random() * open.length)].label;
      setMatched((m) => [...m, ...open.filter((c) => c.label === label).map((c) => c.id)]);
      setFlipped([]);
    }
    setUsed((u) => [...u, id]);
    onSpend?.(id);
    return true;
  };

  const restart = () => {
    clearTimeout(pending.current);
    clearTimeout(peekTimer.current);
    setCards(deal(theme, pairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setWrong(0);
    setTime(0);
    setStarted(false);
    setPeeking(false);
    setFreezeLeft(0);
    setUsed([]);
  };

  return {
    cards, flipped, matched, moves, wrong, time, remaining, started, won, lost, peeking, freezeLeft, used,
    score: matched.length / 2, canUse, flip, use, restart,
  };
}
