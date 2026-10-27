export default function Button({ children, onClick, autoFocus }) {
  return (
    <button className="btn" onClick={onClick} autoFocus={autoFocus}>
      {children}
    </button>
  );
}
