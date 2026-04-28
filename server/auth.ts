import "dotenv/config";
import { betterAuth } from "better-auth";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required in .env");
}

export const auth = betterAuth({
  database: new Pool({
    connectionString: databaseUrl,
  }),
  emailAndPassword: {
    enabled: true,
  },
  trustedOrigins: [
    process.env.CORS_ORIGIN || "http://localhost:8080",
    process.env.VITE_AUTH_BASE_URL || "http://localhost:8080",
  ],
});

