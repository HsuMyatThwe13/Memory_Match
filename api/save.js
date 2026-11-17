import { run } from "./_lib/players.js";
import { getStore } from "./_lib/store.js";

export default async function handler(req, res) {
  let store;
  try {
    store = getStore();
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
  const { status, body } = await run("save", req.method, req.body, store);
  res.status(status).json(body);
}
