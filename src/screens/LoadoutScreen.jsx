import { useState } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import PowerCard from "../components/PowerCard";
import { MIXED } from "../data/themes";
import { POWERUP_IDS, MAX_LOADOUT, TIMER_PAIRS, TIMER_LABEL } from "../data/powerups";

export default function LoadoutScreen({ cards, onStart, onBack }) {
  const [loadout, setLoadout] = useState([]);
  const left = (id) => cards[id] - loadout.filter((x) => x === id).length;
  const full = loadout.length >= MAX_LOADOUT;
  const total = POWERUP_IDS.reduce((sum, id) => sum + cards[id], 0);

  return (
    <Screen bg={MIXED.bg} className="menu loadout">
      <div className="top"><Button onClick={onBack}>Back</Button></div>
      <h1 className="title">Get ready!</h1>
      <p className="lead2">{TIMER_PAIRS} pairs in {TIMER_LABEL}. Pick up to {MAX_LOADOUT} Benefit Cards.</p>
      <h2 className="title">Your cards</h2>
      <div className="row levels">
        {POWERUP_IDS.map((id) => (
          <PowerCard key={id} id={id} count={left(id)} disabled={full || left(id) < 1}
            onClick={() => setLoadout([...loadout, id])} />
        ))}
      </div>
      <h2 className="title">Equipped (tap a card to remove it)</h2>
      <div className="slots">
        {Array.from({ length: MAX_LOADOUT }, (_, i) =>
          loadout[i] ? (
            <PowerCard key={i} id={loadout[i]} small onClick={() => setLoadout(loadout.filter((_, k) => k !== i))} />
          ) : (
            <div className="slot" key={i}>Empty</div>
          ),
        )}
      </div>
      <Button onClick={() => onStart(loadout)}>Start</Button>
      <p className="hint2">
        {total === 0 ? "You have no Benefit Cards yet. Win Classic games to earn some, or just start." : "Cards are used up when you play them."}
      </p>
    </Screen>
  );
}
