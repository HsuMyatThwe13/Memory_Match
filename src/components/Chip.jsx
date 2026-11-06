export default function Chip({ children, selected, onClick }) {
  return (
    <button className={`chip${selected ? " on" : ""}`} type="button" aria-pressed={selected} onClick={onClick}>
      {children}
    </button>
  );
}
