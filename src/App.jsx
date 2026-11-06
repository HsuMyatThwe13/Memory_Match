import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import ModeScreen from "./screens/ModeScreen";
import ThemeScreen from "./screens/ThemeScreen";
import LoadoutScreen from "./screens/LoadoutScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import HistoryScreen from "./screens/HistoryScreen";
import HowToPlayScreen from "./screens/HowToPlayScreen";
import usePlayer from "./hooks/usePlayer";
import { pairsFor } from "./data/levels";
import { MIXED } from "./data/themes";
import { TIMER_PAIRS } from "./data/powerups";

export default function App() {
  const player = usePlayer();
  const [screen, setScreen] = useState("home");
  const [setup, setSetup] = useState(null);
  const [result, setResult] = useState(null);
  const [earned, setEarned] = useState([]);
  const [round, setRound] = useState(0);

  const start = (next) => {
    setSetup(next);
    setRound((r) => r + 1);
    setScreen("game");
  };
  const playClassic = (theme, level) => start({ mode: "classic", theme, level, pairs: pairsFor(theme, level), loadout: [] });
  const playTimer = (loadout) => start({ mode: "timer", theme: MIXED, level: null, pairs: TIMER_PAIRS, loadout });

  const finish = (r) => {
    if (setup.mode === "classic") {
      setEarned(player.recordClassic({ ...r, theme: setup.theme, level: setup.level, pairs: setup.pairs }));
    } else {
      setEarned([]);
      player.recordTimer({ ...r, loadout: setup.loadout });
    }
    setResult(r);
    setScreen("result");
  };

  switch (player.name ? screen : "home") {
    case "mode":
      return <ModeScreen onBack={() => setScreen("home")} onClassic={() => setScreen("themes")} onTimer={() => setScreen("loadout")} onHelp={() => setScreen("howto")} />;
    case "howto":
      return <HowToPlayScreen onBack={() => setScreen("mode")} />;
    case "themes":
      return <ThemeScreen onBack={() => setScreen("mode")} onPlay={playClassic} />;
    case "loadout":
      return <LoadoutScreen cards={player.profile.cards} onBack={() => setScreen("mode")} onStart={playTimer} />;
    case "game":
      return <GameScreen key={round} {...setup} onSpend={player.spendCard} onFinish={finish}
        onQuit={() => setScreen(setup.mode === "timer" ? "mode" : "themes")} />;
    case "result":
      return <ResultScreen {...setup} result={result} earned={earned} onHome={() => setScreen("home")}
        onReplay={() => (setup.mode === "timer" ? setScreen("loadout") : playClassic(setup.theme, setup.level))} />;
    case "history":
      return <HistoryScreen name={player.name} profile={player.profile} saved={player.saved} onBack={() => setScreen("home")}
        onExport={player.exportCurrent} onImport={player.importFile} onReset={player.resetProgress} />;
    default:
      return <HomeScreen name={player.name} names={player.names} onSignIn={player.signIn} onSignOut={player.signOut}
        onPlay={() => setScreen("mode")} onHistory={() => setScreen("history")} />;
  }
}
