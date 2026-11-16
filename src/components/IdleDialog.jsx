import Button from "./Button";

export default function IdleDialog({ secondsLeft, onKeep }) {
  return (
    <div className="ov">
      <div className="dlg" role="alertdialog" aria-modal="true" aria-labelledby="idle-title" aria-describedby="idle-text">
        <h2 id="idle-title">Are you still there?</h2>
        <p id="idle-text">The game will quit in <b>{secondsLeft}</b> seconds.</p>
        <Button autoFocus onClick={onKeep}>Keep Playing</Button>
      </div>
    </div>
  );
}
