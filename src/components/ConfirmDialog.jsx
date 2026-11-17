import { useEffect } from "react";
import Button from "./Button";

export default function ConfirmDialog({ title, text, confirmLabel, cancelLabel = "Cancel", confirmFirst, danger, onConfirm, onCancel }) {
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
        <div className={`row${confirmFirst ? " reverse" : ""}`}>
          <Button autoFocus onClick={onCancel}>{cancelLabel}</Button>
          <Button danger={danger} onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}
