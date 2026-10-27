import { BACK } from "../data/themes";

export default function Card({ card, index, up, matched, onFlip }) {
  const label = matched ? `${card.label}, matched` : up ? card.label : "face down";
  return (
    <button className={`card${up ? " up" : ""}${matched ? " ok" : ""}`} onClick={() => onFlip(card)}
      aria-label={`Card ${index + 1}: ${label}`} aria-disabled={matched}>
      <span className="inner">
        <span className="face back"><img src={BACK} alt="" draggable="false" /></span>
        <span className="face front"><img src={card.src} alt="" draggable="false" /></span>
      </span>
    </button>
  );
}
