import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import ThemeScreen from "./screens/ThemeScreen";
import GameScreen from "./screens/GameScreen";
import ResultScreen from "./screens/ResultScreen";
import { pairsFor } from "./data/levels";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [setup, setSetup] = useState(null);
  const [result, setResult] = useState(null);
  const [round, setRound] = useState(0);

  const play = (theme, level) => {
    setSetup({ theme, level, pairs: pairsFor(theme, level) });
    setRound((r) => r + 1);
    setScreen("game");
  };

  if (screen === "game") {
    return <GameScreen key={round} theme={setup.theme} pairs={setup.pairs} onQuit={() => setScreen("themes")}
      onFinish={(r) => { setResult(r); setScreen("result"); }} />;
  }
  if (screen === "result") {
    return <ResultScreen {...setup} result={result} onHome={() => setScreen("home")}
      onReplay={() => play(setup.theme, setup.level)} />;
  }
  if (screen === "themes") return <ThemeScreen onBack={() => setScreen("home")} onPlay={play} />;
  return <HomeScreen onStart={() => setScreen("themes")} />;
}
