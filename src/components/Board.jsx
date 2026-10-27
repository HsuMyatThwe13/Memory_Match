import Card from "./Card";

export default function Board({ cards, flipped, matched, onFlip }) {
  return (
    <div className="board" role="group" aria-label="Memory cards, 4 columns by 2 rows">
      {cards.map((card, i) => {
        const isMatched = matched.includes(card.id);
        return <Card key={card.id} card={card} index={i} matched={isMatched}
          up={isMatched || flipped.includes(card.id)} onFlip={onFlip} />;
      })}
    </div>
  );
}
