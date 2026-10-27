import Screen from "../components/Screen";
import Button from "../components/Button";
import StatsBar from "../components/StatsBar";
import Board from "../components/Board";
import WinOverlay from "../components/WinOverlay";
import useMemoryGame from "../hooks/useMemoryGame";

export default function GameScreen({ theme, onQuit, onThemes }) {
  const g = useMemoryGame(theme);
  return (
    <Screen bg={theme.bg}>
      <div className="top">
        <Button onClick={onQuit}>Quit</Button>
        <Button onClick={g.restart}>Restart</Button>
      </div>
      <StatsBar time={g.time} score={g.score} moves={g.moves} />
      <Board cards={g.cards} flipped={g.flipped} matched={g.matched} onFlip={g.flip} />
      {g.won && <WinOverlay moves={g.moves} time={g.time} onAgain={g.restart} onThemes={onThemes} />}
    </Screen>
  );
}
