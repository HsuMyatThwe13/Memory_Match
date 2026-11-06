import { useEffect, useState } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import StatsBar from "../components/StatsBar";
import Board from "../components/Board";
import ActionDock from "../components/ActionDock";
import useMemoryGame from "../hooks/useMemoryGame";
import { TIMER_SECONDS } from "../data/powerups";

export default function GameScreen({ mode, theme, pairs, loadout, onQuit, onFinish, onSpend }) {
  const timer = mode === "timer";
  const g = useMemoryGame(theme, pairs, timer ? { seconds: TIMER_SECONDS, onSpend } : {});
  const [spent, setSpent] = useState([]);

  useEffect(() => {
    if (!g.won && !g.lost) return;
    const t = setTimeout(() => onFinish({
      won: g.won, moves: g.moves, wrong: g.wrong, time: g.time, remaining: g.remaining, found: g.score, used: g.used,
    }), 800);
    return () => clearTimeout(t);
  }, [g.won, g.lost]);

  const useSlot = (i) => g.use(loadout[i]) && setSpent((s) => [...s, i]);

  return (
    <Screen bg={theme.bg} className={timer ? "timed" : ""}>
      <div className="top">
        <Button onClick={onQuit}>Quit</Button>
        {!timer && <Button onClick={g.restart}>Restart</Button>}
      </div>
      <StatsBar time={timer ? g.remaining : g.time} countdown={timer} score={g.score} moves={g.moves} frozen={g.freezeLeft} />
      <Board cards={g.cards} flipped={g.flipped} matched={g.matched} peeking={g.peeking} onFlip={g.flip} />
      {timer && <ActionDock loadout={loadout} spent={spent} canUse={g.canUse} onUse={useSlot} />}
    </Screen>
  );
}
