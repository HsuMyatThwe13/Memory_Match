export default function Button({ children, onClick, disabled, ...rest }) {
  return (
    <button className="btn" onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
