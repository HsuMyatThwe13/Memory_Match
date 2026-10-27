import Button from "./Button";
import { fmt } from "../utils";

export default function WinOverlay({ moves, time, onAgain, onThemes }) {
  return (
    <div className="ov">
      <div className="dlg" role="dialog" aria-modal="true" aria-labelledby="win-title">
        <h2 id="win-title">🎉 You win!</h2>
        <p>Moves: {moves} · Time: {fmt(time)}</p>
        <div className="row">
          <Button autoFocus onClick={onAgain}>Play Again</Button>
          <Button onClick={onThemes}>Themes</Button>
        </div>
      </div>
    </div>
  );
}
