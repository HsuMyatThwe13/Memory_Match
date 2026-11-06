import { fmt } from "../utils";

export default function StatsBar({ time, score, moves, countdown, frozen }) {
  return (
    <div className="hud" role="group" aria-label="Game stats">
      <span className={countdown && time <= 10 ? "low" : ""}>
        {countdown ? "TIME LEFT" : "TIME"}: {fmt(time)}
      </span>
      <span>SCORES: {score}</span>
      <span>MOVES: {moves}</span>
      {frozen > 0 && <span className="frozen">FROZEN: {frozen}s</span>}
    </div>
  );
}
