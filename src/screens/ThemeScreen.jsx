import { useState } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import ThemeCard from "../components/ThemeCard";
import Chip from "../components/Chip";
import { THEMES, MENU_BG } from "../data/themes";
import { LEVELS, pairsFor } from "../data/levels";

export default function ThemeScreen({ onPlay, onBack }) {
  const [theme, setTheme] = useState(null);
  const [level, setLevel] = useState(null);
  const ready = theme && level;

  return (
    <Screen bg={MENU_BG} className="menu">
      <div className="top"><Button onClick={onBack}>Back</Button></div>
      <h1 className="title">Choose a theme</h1>
      <div className="themes">
        {THEMES.map((t) => <ThemeCard key={t.id} theme={t} selected={theme?.id === t.id} onPick={setTheme} />)}
      </div>
      <h2 className="title sub">Choose a level</h2>
      <div className="row levels">
        {LEVELS.map((l) => (
          <Chip key={l.id} selected={level?.id === l.id} onClick={() => setLevel(l)}>
            {l.label} · {theme ? pairsFor(theme, l) : l.pairs} pairs
          </Chip>
        ))}
      </div>
      <Button disabled={!ready} onClick={() => onPlay(theme, level)} aria-describedby="hint">Play</Button>
      <p id="hint" className="hint">{ready ? "" : "Pick a theme and a level to play"}</p>
    </Screen>
  );
}
