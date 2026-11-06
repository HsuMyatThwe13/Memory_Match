export default function Button({ children, onClick, disabled, ...rest }) {
  return (
    <button className="btn" type="button" onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
