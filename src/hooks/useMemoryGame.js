import { useState, useEffect, useRef } from "react";
import { shuffle } from "../utils";

const deal = (theme, pairs) =>
  shuffle(shuffle(theme.items).slice(0, pairs).flatMap((item) => [item, item])).map((item, id) => ({ ...item, id }));

export default function useMemoryGame(theme, pairs) {
  const [cards, setCards] = useState(() => deal(theme, pairs));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [started, setStarted] = useState(false);
  const pending = useRef(null);

  const won = matched.length === cards.length;

  useEffect(() => {
    if (!started || won) return;
    const t = setInterval(() => setTime((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [started, won]);

  useEffect(() => () => clearTimeout(pending.current), []);

  const flip = (card) => {
    if (flipped.length >= 2 || flipped.includes(card.id) || matched.includes(card.id)) return;
    const next = [...flipped, card.id];
    setFlipped(next);
    setStarted(true);
    if (next.length < 2) return;
    setMoves((m) => m + 1);
    const isMatch = cards[next[0]].label === cards[next[1]].label;
    pending.current = setTimeout(() => {
      if (isMatch) setMatched((m) => [...m, ...next]);
      setFlipped([]);
    }, isMatch ? 500 : 900);
  };

  const restart = () => {
    clearTimeout(pending.current);
    setCards(deal(theme, pairs));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
    setTime(0);
    setStarted(false);
  };

  return { cards, flipped, matched, moves, time, started, won, score: matched.length / 2, flip, restart };
}
