async function post(path, body) {
  try {
    const response = await fetch(`/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    let data = null;
    try {
      data = await response.json();
    } catch {
      // the server did not answer with JSON (for example the API is not deployed)
    }
    return { ok: response.ok, status: response.status, data };
  } catch {
    return { ok: false, network: true };
  }
}

export const apiCheck = (name) => post("check", { name });
export const apiLogin = (name, pin, existing = false) => post("login", { name, pin, existing });
export const apiSave = (name, pin, profile) => post("save", { name, pin, profile });
export const apiDelete = (name, pin) => post("delete", { name, pin });
