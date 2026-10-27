export default function Chip({ children, selected, onClick }) {
  return (
    <button className={`chip${selected ? " on" : ""}`} aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  );
}
