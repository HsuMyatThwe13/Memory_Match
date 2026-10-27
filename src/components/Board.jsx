import Card from "./Card";

export default function Board({ cards, flipped, matched, onFlip }) {
  const cols = cards.length > 12 ? 6 : 4;
  const gap = cards.length <= 8 ? "clamp(16px,4vw,56px)" : cards.length <= 12 ? "clamp(12px,3vw,40px)" : "clamp(8px,1.6vw,24px)";
  return (
    <div className="board" style={{ "--cols": cols, "--gap": gap }} role="group"
      aria-label={`Memory cards, ${cols} columns by ${cards.length / cols} rows`}>
      {cards.map((card, i) => {
        const isMatched = matched.includes(card.id);
        return <Card key={card.id} card={card} index={i} matched={isMatched}
          up={isMatched || flipped.includes(card.id)} onFlip={onFlip} />;
      })}
    </div>
  );
}
