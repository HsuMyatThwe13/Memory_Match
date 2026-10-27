import Screen from "../components/Screen";
import Button from "../components/Button";
import ThemeCard from "../components/ThemeCard";
import { THEMES, MENU_BG } from "../data/themes";

export default function ThemeScreen({ onPick, onBack }) {
  return (
    <Screen bg={MENU_BG}>
      <div className="top"><Button onClick={onBack}>Back</Button></div>
      <h1 className="title">Choose a theme</h1>
      <div className="themes">
        {THEMES.map((t) => <ThemeCard key={t.id} theme={t} onPick={onPick} />)}
      </div>
    </Screen>
  );
}
