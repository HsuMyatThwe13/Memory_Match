import Screen from "../components/Screen";
import Button from "../components/Button";
import { MENU_BG } from "../data/themes";
import { TIMER_PAIRS, TIMER_LABEL } from "../data/powerups";

export default function ModeScreen({ onClassic, onTimer, onHelp, onBack }) {
  const narrow = window.innerWidth < 600;
  return (
    <Screen bg={MENU_BG} className="menu">
      <div className="top">
        <Button onClick={onBack}>Back</Button>
        <Button onClick={onHelp}>How to Play</Button>
      </div>
      <h1 className="title">Choose a mode</h1>
      <div className="modes">
        <button className="mode" type="button" onClick={onClassic}>
          <strong>Classic Mode</strong>
          <span>No time limit. Match pairs and earn Benefit Cards.</span>
        </button>
        <button className="mode" type="button" onClick={onTimer} disabled={narrow}>
          <strong>Timer Mode</strong>
          <span>{TIMER_PAIRS} pairs in {TIMER_LABEL}. Use your Benefit Cards.</span>
          {narrow && <em>Needs a bigger screen</em>}
        </button>
      </div>
    </Screen>
  );
}
