import { useState } from "react";
import Button from "./Button";
import Chip from "./Chip";
import { cleanName } from "../storage";

export default function NameForm({ names, onSubmit }) {
  const [value, setValue] = useState("");

  const submit = (e) => {
    e.preventDefault();
    onSubmit(value);
  };

  return (
    <form className="panel namebox" onSubmit={submit}>
      <label className="nlabel" htmlFor="nick">Who is playing?</label>
      <div className="row">
        <input id="nick" className="nick" value={value} maxLength={12} autoComplete="off" autoFocus
          placeholder="Your nickname" onChange={(e) => setValue(e.target.value.replace(/[^\p{L}\p{N} _-]/gu, ""))} />
        <Button type="submit" disabled={!cleanName(value)}>Go</Button>
      </div>
      {names.length > 0 && (
        <div className="row">
          {names.map((n) => <Chip key={n} onClick={() => onSubmit(n)}>{n}</Chip>)}
        </div>
      )}
    </form>
  );
}
