import { useEffect, useState } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import StatsBar from "../components/StatsBar";
import Board from "../components/Board";
import ActionDock from "../components/ActionDock";
import IdleDialog from "../components/IdleDialog";
import ConfirmDialog from "../components/ConfirmDialog";
import TestLinks from "../components/TestLinks";
import useMemoryGame from "../hooks/useMemoryGame";
import useInactivity from "../hooks/useInactivity";
import { TIMER_SECONDS } from "../data/powerups";
import { IDLE_SECONDS, IDLE_GRACE } from "../data/idle";

export default function GameScreen({ mode, theme, pairs, loadout, onQuit, onFinish, onSpend }) {
  const timer = mode === "timer";
  const [spent, setSpent] = useState([]);
  const [confirmQuit, setConfirmQuit] = useState(false);

  const idle = useInactivity({ enabled: !timer, limit: IDLE_SECONDS, grace: IDLE_GRACE, onTimeout: () => !g.won && onQuit() });
  const g = useMemoryGame(theme, pairs, { seconds: timer ? TIMER_SECONDS : 0, onSpend, paused: idle.warning || confirmQuit });

  useEffect(() => {
    if (!g.won && !g.lost) return;
    const t = setTimeout(() => onFinish({
      won: g.won, moves: g.moves, wrong: g.wrong, time: g.time, remaining: g.remaining, found: g.score, used: g.used,
    }), 800);
    return () => clearTimeout(t);
  }, [g.won, g.lost]);

  const useSlot = (i) => g.use(loadout[i]) && setSpent((s) => [...s, i]);
  const flip = (card) => {
    idle.touch();
    g.flip(card);
  };
  const restart = () => {
    idle.touch();
    g.restart();
  };

  return (
    <Screen bg={theme.bg} className={timer ? "timed" : ""}>
      <div className="top">
        <Button onClick={timer ? () => setConfirmQuit(true) : onQuit}>Quit</Button>
        {!timer && <Button onClick={restart}>Restart</Button>}
      </div>
      <StatsBar time={timer ? g.remaining : g.time} countdown={timer} score={g.score} moves={g.moves} frozen={g.freezeLeft} />
      <Board cards={g.cards} flipped={g.flipped} matched={g.matched} peeking={g.peeking} onFlip={flip} />
      {timer && <ActionDock loadout={loadout} spent={spent} canUse={g.canUse} onUse={useSlot} />}
      {idle.warning && !g.won && <IdleDialog secondsLeft={idle.secondsLeft} onKeep={idle.touch} />}
      {confirmQuit && (
        <ConfirmDialog title="Quit the game?" confirmLabel="Quit" cancelLabel="Play" confirmFirst
          text="If you quit now, the game ends and you lose the Benefit Cards you have already used."
          onCancel={() => setConfirmQuit(false)} onConfirm={onQuit} />
      )}
      <TestLinks links={timer
        ? [{ label: "win", onClick: g.cheatWin }, { label: "lose", onClick: g.cheatLose }]
        : [{ label: "inactive for 3 mins", onClick: idle.expire }]} />
    </Screen>
  );
}
