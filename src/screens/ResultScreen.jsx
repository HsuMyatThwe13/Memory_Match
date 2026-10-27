import Screen from "../components/Screen";
import Panel from "../components/Panel";
import Button from "../components/Button";
import { fmt } from "../utils";

export default function ResultScreen({ theme, level, pairs, result, onHome, onReplay }) {
  const rows = [
    ["Theme", theme.label],
    ["Level", `${level.label} (${pairs} pairs)`],
    ["Scores", `${result.score} / ${pairs}`],
    ["Moves", result.moves],
    ["Time", fmt(result.time)],
  ];
  return (
    <Screen bg={theme.bg} className="result">
      <Panel>
        <h1 className="congrats">🎉 Congratulations!</h1>
        <p className="lead">You found all the pairs!</p>
        <dl className="stats">
          {rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        <div className="row">
          <Button onClick={onHome}>Home</Button>
          <Button onClick={onReplay} autoFocus>Replay</Button>
        </div>
      </Panel>
    </Screen>
  );
}
