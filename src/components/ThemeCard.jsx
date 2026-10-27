export default function ThemeCard({ theme, onPick }) {
  return (
    <button className="theme" onClick={() => onPick(theme)} aria-label={`Play with ${theme.label}`}>
      <img src={theme.cover} alt="" draggable="false" />
      <span>{theme.label}</span>
    </button>
  );
}
