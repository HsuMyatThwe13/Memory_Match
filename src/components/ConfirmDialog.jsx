import { useEffect } from "react";
import Button from "./Button";

export default function ConfirmDialog({ title, text, confirmLabel, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onCancel();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);

  return (
    <div className="ov">
      <div className="dlg" role="alertdialog" aria-modal="true" aria-labelledby="cd-title" aria-describedby="cd-text">
        <h2 id="cd-title">{title}</h2>
        <p id="cd-text">{text}</p>
        <div className="row">
          <Button autoFocus onClick={onCancel}>Cancel</Button>
          <Button onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
