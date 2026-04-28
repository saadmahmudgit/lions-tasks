# Tickly Tasks + Better Auth + Supabase

This app now uses Better Auth for email/password sign up and sign in, backed by your Supabase Postgres database.

## 1) Environment variables

Copy `.env.example` to `.env` and update:

- `DATABASE_URL`: your Supabase Postgres connection string
- `AUTH_SERVER_PORT`: auth server port (default `3005`)
- `CORS_ORIGIN`: Vite app URL (default `http://localhost:8080`)
- `VITE_AUTH_BASE_URL`: frontend base URL used by Better Auth client

## 2) Install dependencies

```bash
npm install
```

## 3) Create Better Auth tables in Supabase

```bash
npx auth@latest migrate --yes
```

After migration you should see Better Auth tables (including `user`) in Supabase table editor.

## 4) Run app + auth server (local)

```bash
npm run dev:full
```

Then open `http://localhost:8080` and sign up/sign in at `/auth`.

## 5) Dashboard users

The home page fetches users from the Better Auth `user` table through `/api/users`, so your Supabase users are shown in-app as your dashboard list.

## 6) Vercel production architecture

Production uses Vercel serverless routes (not the Express server):

- `api/auth/[...all].ts` for Better Auth endpoints
- `api/users.ts` for authenticated dashboard users
- `api/health.ts` for basic health checks
- `vercel.json` rewrites for SPA routing + API passthrough
