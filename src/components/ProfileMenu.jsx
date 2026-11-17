import { useState, useEffect } from "react";
import Button from "./Button";
import ConfirmDialog from "./ConfirmDialog";
import { POWERUPS, POWERUP_IDS } from "../data/powerups";

function ProfileIcon({ size = 26 }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false">
      <circle cx="12" cy="8" r="4.2" fill="currentColor" />
      <path d="M3.5 21c0-4.6 3.8-7.5 8.5-7.5s8.5 2.9 8.5 7.5Z" fill="currentColor" />
    </svg>
  );
}

// Profile button (icon and the word Profile inside one button) for the top right of the Home screen. Opens a profile card with Switch account and Delete account.
export default function ProfileMenu({ name, profile, onSignOut, onDelete }) {
  const [view, setView] = useState("closed"); // closed | card | signout | delete
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (view !== "card") return;
    const onKey = (e) => e.key === "Escape" && setView("closed");
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [view]);

  const deleteAccount = async () => {
    if (busy) return;
    setBusy(true);
    const result = await onDelete();
    if (!result.ok) {
      setBusy(false);
      setError(result.error);
      setView("card");
    }
  };

  const classicGames = profile.classic.length;
  const timerGames = profile.timer.length;
  const timerWins = profile.timer.filter((g) => g.won).length;

  return (
    <>
      <button className="btn profilebtn" type="button" aria-label={`Profile: ${name}`} aria-haspopup="dialog"
        onClick={() => { setError(""); setView("card"); }}>
        <ProfileIcon size={20} />
        <span>Profile</span>
      </button>

      {view === "card" && (
        <div className="ov" onClick={(e) => e.target === e.currentTarget && setView("closed")}>
          <div className="dlg pcard" role="dialog" aria-modal="true" aria-labelledby="profile-name">
            <button className="pclose" type="button" aria-label="Close profile" onClick={() => setView("closed")}>×</button>
            <div className="pavatar"><ProfileIcon size={40} /></div>
            <h2 id="profile-name" className="pname">{name}</h2>
            <dl className="pstats">
              {POWERUP_IDS.map((id) => (
                <div key={id}><dt>{POWERUPS[id].label}</dt><dd>{profile.cards[id]}</dd></div>
              ))}
              <div><dt>Classic games</dt><dd>{classicGames}</dd></div>
              <div><dt>Timer games</dt><dd>{timerGames}</dd></div>
              <div><dt>Timer wins</dt><dd>{timerWins}</dd></div>
            </dl>
            <p className="formerr" role="alert">{error}</p>
            <div className="row">
              <Button onClick={() => setView("signout")}>Switch account</Button>
              <Button danger onClick={() => setView("delete")}>Delete account</Button>
            </div>
          </div>
        </div>
      )}

      {view === "signout" && (
        <ConfirmDialog title="Switch account?" confirmLabel="Switch account" onCancel={() => setView("card")}
          text={`You will go back to the sign-in screen. You will need the nickname and PIN to open ${name} again.`} onConfirm={onSignOut} />
      )}
      {view === "delete" && (
        <ConfirmDialog danger title="Delete account?" confirmLabel={busy ? "Deleting..." : "Delete"} onCancel={() => !busy && setView("card")}
          text={`This permanently deletes ${name} and all its cards and history on every device. It cannot be undone.`}
          onConfirm={deleteAccount} />
      )}
    </>
  );
}
