import { useState } from "react";
import Screen from "../components/Screen";
import Button from "../components/Button";
import Panel from "../components/Panel";
import PowerCard from "../components/PowerCard";
import ConfirmDialog from "../components/ConfirmDialog";
import { THEMES, MENU_BG } from "../data/themes";
import { LEVELS } from "../data/levels";
import { POWERUPS, POWERUP_IDS } from "../data/powerups";
import { fmt } from "../utils";

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

export default function HistoryScreen({ name, profile, saved, onBack, onReset, onSignOut, onDelete }) {
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [busy, setBusy] = useState(false);

  const deleteAccount = async () => {
    setBusy(true);
    const result = await onDelete();
    if (!result.ok) {
      setBusy(false);
      setDeleting(false);
      setMessage(result.error);
    }
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
          <Button onClick={() => setConfirming(true)}>Reset progress</Button>
          <Button onClick={() => setSigningOut(true)}>Sign out</Button>
          <Button onClick={() => setDeleting(true)}>Delete account</Button>
        </div>
        <p className="msg" role="status">
          {message || (saved ? "" : "Your latest progress could not be saved to the server. It will try again after your next game.")}
        </p>
      </div>
      {signingOut && (
        <ConfirmDialog title="Sign out?" confirmLabel="Sign out" onCancel={() => setSigningOut(false)}
          text={`You will need the nickname and PIN to open ${name} again.`} onConfirm={onSignOut} />
      )}
      {deleting && (
        <ConfirmDialog title="Delete account?" confirmLabel={busy ? "Deleting..." : "Delete"} onCancel={() => !busy && setDeleting(false)}
          text={`This permanently deletes ${name} and all its cards and history on every device. It cannot be undone.`}
          onConfirm={() => !busy && deleteAccount()} />
      )}
      {confirming && (
        <ConfirmDialog title="Reset progress?" confirmLabel="Reset" onCancel={() => setConfirming(false)}
          text={`This clears all cards and history for ${name}. It cannot be undone.`}
          onConfirm={() => { onReset(); setConfirming(false); setMessage("Progress was reset."); }} />
      )}
    </Screen>
  );
}
