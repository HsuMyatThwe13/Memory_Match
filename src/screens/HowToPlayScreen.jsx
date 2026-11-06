import Screen from "../components/Screen";
import Button from "../components/Button";
import Panel from "../components/Panel";
import PowerCard from "../components/PowerCard";
import { MENU_BG } from "../data/themes";
import { LEVELS } from "../data/levels";
import { POWERUP_IDS, POWERUPS, MAX_LOADOUT, TIMER_PAIRS, TIMER_LABEL } from "../data/powerups";

export default function HowToPlayScreen({ onBack }) {
  const levels = LEVELS.map((l) => `${l.label} (${l.pairs} pairs)`).join(", ");
  return (
    <Screen bg={MENU_BG} className="menu">
      <div className="top"><Button onClick={onBack}>Back</Button></div>
      <h1 className="title">How to Play</h1>
      <div className="guide">
        <Panel>
          <h2>Classic Mode</h2>
          <ol className="steps">
            <li>Choose a theme and a level: {levels}.</li>
            <li>Tap a card to flip it, then tap a second card.</li>
            <li>If both cards show the same picture, they stay face up and you score a point.</li>
            <li>If they are different, they flip back. Remember where they are!</li>
            <li>Find every pair. There is no time limit, but fewer moves is better.</li>
            <li>Good results earn Benefit Cards (see below).</li>
          </ol>
        </Panel>
        <Panel>
          <h2>Timer Mode</h2>
          <ol className="steps">
            <li>Pick up to {MAX_LOADOUT} Benefit Cards to bring. You can also start with none.</li>
            <li>The board has {TIMER_PAIRS} pairs with pictures from all themes. You have {TIMER_LABEL}.</li>
            <li>The clock starts when you flip your first card or use a Benefit Card.</li>
            <li>Tap a Benefit Card under the board to use it. It is used up when you play it.</li>
            <li>Match every pair before the time runs out to win. If time runs out, you see how many pairs you found.</li>
          </ol>
        </Panel>
        <Panel>
          <h2>Benefit Cards</h2>
          <p>Benefit Cards are power-ups. You earn them by winning Classic games, and you use them in Timer Mode.</p>
          <ul className="bcards">
            {POWERUP_IDS.map((id) => (
              <li key={id}>
                <PowerCard id={id} />
                <div>
                  <strong>{POWERUPS[id].label} ({POWERUPS[id].rarity})</strong>
                  <p>What it does: {POWERUPS[id].effect}.</p>
                  <p>How to get it: {POWERUPS[id].earn}.</p>
                </div>
              </li>
            ))}
          </ul>
          <p>
            A wrong flip is a turn where the two cards do not match. Each card belongs to a different level, so one win
            earns at most one card. Your cards are saved under your nickname on this device. You can see them any time in
            the History Hub.
          </p>
        </Panel>
      </div>
    </Screen>
  );
}
