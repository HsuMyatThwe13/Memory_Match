export default function Button({ children, onClick, disabled, danger, ...rest }) {
  return (
    <button className={danger ? "btn danger" : "btn"} type="button" onClick={onClick} disabled={disabled} {...rest}>
      {children}
    </button>
  );
}
