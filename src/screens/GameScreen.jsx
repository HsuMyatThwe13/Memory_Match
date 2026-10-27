import { useEffect } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import StatsBar from "../components/StatsBar";
import Board from "../components/Board";
import useMemoryGame from "../hooks/useMemoryGame";

export default function GameScreen({ theme, pairs, onQuit, onFinish }) {
  const g = useMemoryGame(theme, pairs);

  useEffect(() => {
    if (!g.won) return;
    const t = setTimeout(() => onFinish({ moves: g.moves, time: g.time, score: g.score }), 800);
    return () => clearTimeout(t);
  }, [g.won]);

  return (
    <Screen bg={theme.bg}>
      <div className="top">
        <Button onClick={onQuit}>Quit</Button>
        <Button onClick={g.restart}>Restart</Button>
      </div>
      <StatsBar time={g.time} score={g.score} moves={g.moves} />
      <Board cards={g.cards} flipped={g.flipped} matched={g.matched} onFlip={g.flip} />
    </Screen>
  );
}
