import "dotenv/config";
import express from "express";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import { Pool } from "pg";
import { auth } from "./auth";

const app = express();
const port = Number(process.env.AUTH_SERVER_PORT || 3005);

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

app.all(/^\/api\/auth\/.*/, toNodeHandler(auth));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/api/users", async (req, res) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await db.query(
    'SELECT id, name, email, "createdAt" as created_at FROM "user" ORDER BY "createdAt" DESC LIMIT 100'
  );
  return res.json({ users: result.rows });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Auth server listening on http://localhost:${port}`);
});

