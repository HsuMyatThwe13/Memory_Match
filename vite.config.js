import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { run } from "./api/_lib/players.js";
import { getStore } from "./api/_lib/store.js";

// Serves /api/login and /api/save while running `npm run dev`, using the same code as the Vercel functions.
// Without database settings it keeps accounts in memory, so they are lost when the dev server restarts.
const devApi = () => ({
  name: "memory-match-dev-api",
  configureServer(server) {
    server.middlewares.use("/api", async (req, res) => {
      const chunks = [];
      for await (const chunk of req) chunks.push(chunk);
      let body = {};
      try {
        body = JSON.parse(Buffer.concat(chunks).toString() || "{}");
      } catch {
        // an unreadable body is treated as empty and rejected by validation
      }
      const action = req.url.split("?")[0].replace(/^\//, "");
      const { status, body: payload } = await run(action, req.method, body, getStore());
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(payload));
    });
  },
});

export default defineConfig({
  plugins: [react(), devApi()],
  test: { environment: "jsdom", globals: false, restoreMocks: true },
});
