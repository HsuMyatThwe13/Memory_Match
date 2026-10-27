import { fmt } from "../utils";

export default function StatsBar({ time, score, moves }) {
  return (
    <div className="hud" role="group" aria-label="Game stats">
      <span>TIME: {fmt(time)}</span>
      <span>SCORES: {score}</span>
      <span>MOVES: {moves}</span>
    </div>
  );
}
