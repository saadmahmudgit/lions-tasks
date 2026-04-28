import { fromNodeHeaders } from "better-auth/node";
import { Pool } from "pg";
import { auth } from "../src/lib/auth";

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const result = await db.query(
    'SELECT id, name, email, "createdAt" as created_at FROM "user" ORDER BY "createdAt" DESC LIMIT 100'
  );

  return res.status(200).json({ users: result.rows });
}

