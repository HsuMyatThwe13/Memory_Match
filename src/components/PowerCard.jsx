import PowerIcon from "./PowerIcon";
import { POWERUPS } from "../data/powerups";

export default function PowerCard({ id, count, small, used, note, disabled, onClick }) {
  const power = POWERUPS[id];
  const className = `power ${power.rarity.toLowerCase()}${small ? " small" : ""}${used ? " used" : ""}`;
  const body = (
    <>
      <PowerIcon id={id} size={small ? 34 : 52} />
      <span className="pname">{power.label}</span>
      {!small && <span className="prarity">{power.rarity}</span>}
      {count !== undefined && <span className="pcount">x{count}</span>}
      {note && <span className="pnote">{note}</span>}
    </>
  );
  if (!onClick) return <div className={className}>{body}</div>;
  const owned = count !== undefined ? `, you have ${count}` : "";
  return (
    <button className={className} type="button" onClick={onClick} disabled={disabled} title={power.effect}
      aria-label={`${power.label}: ${power.effect}${owned}`}>
      {body}
    </button>
  );
}
