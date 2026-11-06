import PowerCard from "./PowerCard";

export default function ActionDock({ loadout, spent, canUse, onUse }) {
  if (!loadout.length) return null;
  return (
    <div className="dock" role="group" aria-label="Benefit Cards">
      {loadout.map((id, i) => {
        const used = spent.includes(i);
        return <PowerCard key={i} id={id} small used={used} note={used ? "Used" : undefined}
          disabled={used || !canUse[id]} onClick={() => onUse(i)} />;
      })}
    </div>
  );
}
