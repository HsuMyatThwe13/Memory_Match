import { useState } from "react";
import Button from "./Button";
import { cleanName } from "../storage";

// Step 1: ask for the nickname. Step 2: ask for the PIN (to open an existing nickname, or to create a new one).
export default function NameForm({ onCheck, onSubmit }) {
  const [value, setValue] = useState("");
  const [pin, setPin] = useState("");
  const [account, setAccount] = useState(null); // { name, exists } once the nickname is confirmed
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const back = () => {
    setAccount(null);
    setPin("");
    setError("");
  };

  const next = async (e) => {
    e.preventDefault();
    if (!cleanName(value) || busy) return;
    setBusy(true);
    setError("");
    const result = await onCheck(value);
    setBusy(false);
    if (result.ok) setAccount({ name: result.name, exists: result.exists });
    else setError(result.error);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (pin.length !== 4 || busy) return;
    setBusy(true);
    setError("");
    const result = await onSubmit(account.name, pin);
    if (!result.ok) {
      setError(result.error);
      setPin("");
      setBusy(false);
    }
  };

  if (account) {
    return (
      <form className="panel namebox" onSubmit={submit}>
        <label className="nlabel" htmlFor="pin">
          {account.exists ? `Welcome back, ${account.name}!` : `Hello, ${account.name}!`}
        </label>
        <p className="formnote">
          {account.exists ? "Enter your 4-digit PIN to open your game." : "This nickname is new. Choose a 4-digit PIN to create it."}
        </p>
        <input id="pin" className="nick pin" value={pin} maxLength={4} type="password" inputMode="numeric"
          pattern="[0-9]*" autoComplete="off" autoFocus placeholder="4-digit PIN"
          onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 4))} />
        <p className="formerr" role="alert">{error}</p>
        <Button type="submit" disabled={pin.length !== 4 || busy}>{busy ? "..." : account.exists ? "Open" : "Create"}</Button>
        <button className="link" type="button" onClick={back}>Use a different nickname</button>
      </form>
    );
  }

  return (
    <form className="panel namebox" onSubmit={next}>
      <label className="nlabel" htmlFor="nick">Who is playing?</label>
      <input id="nick" className="nick" value={value} maxLength={12} autoComplete="off" autoFocus
        placeholder="Your nickname" onChange={(e) => setValue(e.target.value.replace(/[^\p{L}\p{N} _-]/gu, ""))} />
      <p className="formnote">Nicknames are case sensitive, enter the exact name.</p>
      <p className="formerr" role="alert">{error}</p>
      <Button type="submit" disabled={!cleanName(value) || busy}>{busy ? "..." : "Next"}</Button>
    </form>
  );
}
