import { useState } from "react";
import HomeScreen from "./screens/HomeScreen";
import ThemeScreen from "./screens/ThemeScreen";
import GameScreen from "./screens/GameScreen";

export default function App() {
  const [screen, setScreen] = useState("home");
  const [theme, setTheme] = useState(null);

  if (screen === "game") {
    return <GameScreen key={theme.id} theme={theme} onQuit={() => setScreen("home")} onThemes={() => setScreen("themes")} />;
  }
  if (screen === "themes") {
    return <ThemeScreen onBack={() => setScreen("home")} onPick={(t) => { setTheme(t); setScreen("game"); }} />;
  }
  return <HomeScreen onStart={() => setScreen("themes")} />;
}
