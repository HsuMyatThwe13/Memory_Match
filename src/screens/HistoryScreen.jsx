import { useRef, useState } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import Panel from "../components/Panel";
import PowerCard from "../components/PowerCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { THEMES, MENU_BG } from "../data/themes";
import { LEVELS } from "../data/levels";
import { POWERUPS, POWERUP_IDS } from "../data/powerups";
import { fmt, downloadText } from "../utils";

const labelOf = (list, id) => list.find((x) => x.id === id)?.label ?? "-";
const date = (ts) => (ts ? new Date(ts).toLocaleDateString() : "-");
const cardNames = (ids) => (ids.length ? ids.map((id) => POWERUPS[id].label).join(", ") : "-");

function Table({ label, head, rows }) {
  if (!rows.length) return <p className="empty">No games yet.</p>;
  return (
    <div className="scroller" role="region" aria-label={label} tabIndex={0}>
      <table className="table">
        <thead><tr>{head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((cells, i) => <tr key={i}>{cells.map((c, k) => <td key={k}>{c}</td>)}</tr>)}
        </tbody>
      </table>
    </div>
  );
}

export default function HistoryScreen({ name, profile, saved, onBack, onExport, onImport, onReset }) {
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const fileInput = useRef(null);

  const pickFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (file) setMessage(onImport(await file.text()));
  };

  const classic = profile.classic.map((e) => [
    date(e.ts), labelOf(THEMES, e.theme), labelOf(LEVELS, e.level), e.moves, fmt(e.time), cardNames(e.earned),
  ]);
  const timer = profile.timer.map((e) => [
    date(e.ts), e.won ? "Win" : "Time's up", e.won ? `${fmt(e.remaining)} left` : `${e.found} pairs found`, cardNames(e.used),
  ]);

  return (
    <Screen bg={MENU_BG} className="menu">
      <div className="top"><Button onClick={onBack}>Back</Button></div>
      <h1 className="title">History Hub</h1>
      <div className="hub">
        <Panel>
          <h2>My Cards ({name})</h2>
          <div className="row">
            {POWERUP_IDS.map((id) => <PowerCard key={id} id={id} count={profile.cards[id]} />)}
          </div>
        </Panel>
        <Panel>
          <h2>Classic History</h2>
          <Table label="Classic history" head={["Date", "Theme", "Level", "Moves", "Time", "Card earned"]} rows={classic} />
        </Panel>
        <Panel>
          <h2>Timer History</h2>
          <Table label="Timer history" head={["Date", "Result", "Left / found", "Cards used"]} rows={timer} />
        </Panel>
        <div className="row">
          <Button onClick={() => downloadText(`memorymatch-${name}.json`, onExport())}>Export</Button>
          <Button onClick={() => fileInput.current.click()}>Import</Button>
          <Button onClick={() => setConfirming(true)}>Reset progress</Button>
          <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={pickFile} />
        </div>
        <p className="msg" role="status">
          {message || (saved ? "" : "This browser cannot save progress (private window?). Use Export to keep a backup.")}
        </p>
      </div>
      {confirming && (
        <ConfirmDialog title="Reset progress?" confirmLabel="Reset" onCancel={() => setConfirming(false)}
          text={`This clears all cards and history for ${name}. It cannot be undone.`}
          onConfirm={() => { onReset(); setConfirming(false); setMessage("Progress was reset."); }} />
      )}
    </Screen>
  );
}
