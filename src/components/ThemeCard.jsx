export default function ThemeCard({ theme, selected, onPick }) {
  return (
    <button className={`theme${selected ? " on" : ""}`} onClick={() => onPick(theme)}
      aria-pressed={selected} aria-label={`${theme.label} theme`}>
      <img src={theme.cover} alt="" draggable="false" />
      <span>{theme.label}</span>
    </button>
  );
}
