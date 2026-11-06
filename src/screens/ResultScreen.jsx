import Screen from "../components/Screen";
import Panel from "../components/Panel";
import Button from "../components/Button";
import PowerCard from "../components/PowerCard";
import { fmt } from "../utils";
import { POWERUPS } from "../data/powerups";
import { cardForLevel } from "../data/rewards";

const names = (ids) => (ids.length ? ids.map((id) => POWERUPS[id].label).join(", ") : "None");

function summary({ mode, theme, level, pairs, result }) {
  if (mode === "classic") {
    return {
      title: "🎉 Congratulations!",
      lead: "You found all the pairs!",
      rows: [
        ["Theme", theme.label],
        ["Level", `${level.label} (${pairs} pairs)`],
        ["Scores", `${result.found} / ${pairs}`],
        ["Moves", result.moves],
        ["Wrong flips", result.wrong],
        ["Time", fmt(result.time)],
      ],
    };
  }
  const rows = [["Mode", "Timer Mode"], ["Scores", `${result.found} / ${pairs}`], ["Moves", result.moves]];
  if (result.won) rows.push(["Time left", fmt(result.remaining)]);
  rows.push(["Cards used", names(result.used)]);
  return result.won
    ? { title: "🎉 You beat the clock!", lead: "All pairs found in time!", rows }
    : { title: "⏰ Time's up!", lead: `You found ${result.found} of ${pairs} pairs. Try again!`, rows };
}

export default function ResultScreen({ mode, theme, level, pairs, result, earned, onHome, onReplay }) {
  const { title, lead, rows } = summary({ mode, theme, level, pairs, result });
  const hint = mode === "classic" && !earned.length ? POWERUPS[cardForLevel(level.id)] : null;
  return (
    <Screen bg={theme.bg} className="result">
      <Panel>
        <h1 className="congrats">{title}</h1>
        <p className="lead">{lead}</p>
        <dl className="stats">
          {rows.map(([k, v]) => (
            <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
          ))}
        </dl>
        {earned.length > 0 && (
          <div className="earned">
            <p className="lead">You earned a Benefit Card!</p>
            <div className="row">{earned.map((id) => <PowerCard key={id} id={id} note="+1" />)}</div>
          </div>
        )}
        {hint && <p className="tip">No Benefit Card this time. Tip: {hint.earn.toLowerCase()} to earn {hint.label}.</p>}
        <div className="row">
          <Button onClick={onHome}>Home</Button>
          <Button onClick={onReplay} autoFocus>Replay</Button>
        </div>
      </Panel>
    </Screen>
  );
}
