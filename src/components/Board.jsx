import Card from "./Card";

export default function Board({ cards, flipped, matched, peeking, onFlip }) {
  const n = cards.length;
  const big = n > 18;
  const cols = big ? 8 : n > 12 ? 6 : 4;
  const gap = n <= 8 ? "clamp(16px,4vw,56px)" : n <= 12 ? "clamp(12px,3vw,40px)" : "clamp(8px,1.6vw,24px)";
  const style = { "--cols": cols, "--gap": big ? "clamp(8px,2.2vh,18px) clamp(8px,1.6vw,26px)" : gap };
  if (big) style["--size"] = "clamp(34px, min(calc(11vw - 6px), calc((60vh - 4 * clamp(8px, 2.2vh, 18px)) / 5)), 110px)";
  return (
    <div className="board" style={style} role="group" aria-label={`Memory cards, ${cols} columns by ${n / cols} rows`}>
      {cards.map((card, i) => {
        const isMatched = matched.includes(card.id);
        return <Card key={card.id} card={card} index={i} matched={isMatched}
          up={isMatched || peeking || flipped.includes(card.id)} onFlip={onFlip} />;
      })}
    </div>
  );
}
